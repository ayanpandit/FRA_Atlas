# water.py
"""
🌊 Water Analysis Tool using Google Earth Engine
This script calculates:
1. Surface water area and percentage
2. Saves a local water map image

Requirements:
- Google Earth Engine Python API
- Earth Engine project authenticated
"""

import ee
import datetime
import requests

import os

# ----------------------------- Initialize GEE -----------------------------
# Replace with your GEE project ID
EE_PROJECT_ID = os.getenv('GOOGLE_EARTH_ENGINE_PROJECT', 'fra-a-472418')
try:
    ee_sa_json = os.getenv('EE_SERVICE_ACCOUNT_JSON')
    ee_credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if ee_sa_json and not ee_credentials_path:
        tmp_path = 'FRA_Exports/ee_service_account.json'
        os.makedirs('FRA_Exports', exist_ok=True)
        with open(tmp_path, 'w', encoding='utf-8') as fh:
            fh.write(ee_sa_json)
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = tmp_path
        ee_credentials_path = tmp_path
        print(f"🔐 Wrote Earth Engine service account to: {tmp_path}")

    if ee_credentials_path:
        print(f"🔐 Using GOOGLE_APPLICATION_CREDENTIALS from: {ee_credentials_path}")

    ee.Initialize(project=EE_PROJECT_ID)
    print(f"✅ Earth Engine initialized with project {EE_PROJECT_ID}")
except Exception as e:
    print(f"❌ Earth Engine initialization failed: {e}")
    print('Hint: set EE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS to authenticate Earth Engine.')
    raise

# ----------------------------- User Input -----------------------------
lat_lon = input("Enter latitude and longitude separated by comma (e.g., 25.76,84.15): ")
radius = float(input("Enter radius in meters (>=10): "))

# Convert input to floats
lat, lon = [float(x.strip()) for x in lat_lon.split(",")]

# Create AOI as circle geometry
aoi = ee.Geometry.Point([lon, lat]).buffer(radius)
print(f"\n✅ AOI created: center=({lat},{lon}), radius={radius} m")
print(f"   AOI bbox (lon/lat): {aoi.bounds().getInfo()['coordinates']}")

# ----------------------------- Surface Water Detection -----------------------------
print("\n🌍 Using Sentinel-2 data for surface water detection...")

# Date range for recent images (last 6 months)
end_date = datetime.datetime.utcnow()
start_date = end_date - datetime.timedelta(days=180)

# Load Sentinel-2 surface reflectance data
s2 = ee.ImageCollection("COPERNICUS/S2_SR") \
    .filterBounds(aoi) \
    .filterDate(start_date, end_date) \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))

# Check if images exist
if s2.size().getInfo() == 0:
    print("⚠️ No Sentinel-2 images available for this AOI/date range. Exiting.")
    exit()

# Compute median image and select relevant bands
s2_med = s2.median()
nir = s2_med.select('B8')  # Near-infrared
green = s2_med.select('B3')  # Green band

# Modified Normalized Difference Water Index (MNDWI)
mndwi = green.subtract(s2_med.select('B11')).divide(green.add(s2_med.select('B11')))
water_mask = mndwi.gt(0)  # threshold for water

# Calculate water area (in hectares)
pixel_area = ee.Image.pixelArea()
stats = pixel_area.updateMask(water_mask).reduceRegion(
    reducer=ee.Reducer.sum(),
    geometry=aoi,
    scale=10,
    maxPixels=1e10
).getInfo()

water_area_m2 = stats['area'] if 'area' in stats else 0
water_area_ha = water_area_m2 / 10000 if water_area_m2 else 0
aoi_area_m2 = aoi.area().getInfo()
water_percentage = (water_area_m2 / aoi_area_m2) * 100 if aoi_area_m2 else 0

print(f"\n💧 Estimated surface water area: {water_area_ha:.2f} hectares inside AOI")
print(f"💦 Water coverage: {water_percentage:.2f}% of AOI")

# ----------------------------- Save Surface Water Map -----------------------------
print("\n💾 Saving visualization locally...")

# Prepare water visualization image
vis_params = {'min': 0, 'max': 1, 'palette': ['white', 'blue']}
water_vis = water_mask.visualize(**vis_params)

# Export as PNG locally
url = water_vis.getThumbURL({'region': aoi, 'format': 'png', 'dimensions': 512})
r = requests.get(url)
with open("water_map.png", "wb") as f:
    f.write(r.content)

print("✅ Water map saved locally as water_map.png")

# ----------------------------- End of Script -----------------------------
print("\n🎉 Water surface analysis completed successfully!")
