import ee
import os
import numpy as np
import matplotlib.pyplot as plt
import requests

# -------------------------------
# STEP 1: Initialize Earth Engine (Connect to Google's satellite data)
# -------------------------------
EE_PROJECT_ID = "fra-a-472418"  # Your Google Earth Engine project ID
ee.Initialize(project=EE_PROJECT_ID)
print("✅ Earth Engine initialized.")

# -------------------------------
# STEP 2: Create output folder for saving images locally
# -------------------------------
OUTPUT_FOLDER = "FRA_Exports"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# -------------------------------
# STEP 3: Get coordinates from user input (ORIGINAL CODE - NOT CHANGED)
# -------------------------------
lat_lon = input("Enter latitude and longitude separated by comma (e.g., 25.76177,84.15032): ")
lat, lon = [float(x.strip()) for x in lat_lon.split(",")]
radius_m = max(10, float(input("Enter radius in meters (>=10 m): ")))

# Convert radius in meters to degrees (approx.) - ORIGINAL CODE
radius_deg = radius_m / 111320
min_lat, max_lat = lat - radius_deg, lat + radius_deg
min_lon, max_lon = lon - radius_deg, lon + radius_deg
aoi = ee.Geometry.Rectangle([min_lon, min_lat, max_lon, max_lat])
print(f"✅ AOI rectangle created: {[min_lon, min_lat, max_lon, max_lat]}")

# Create ROI for local downloads only (separate from analysis AOI)
point = ee.Geometry.Point([lon, lat])
roi = point.buffer(radius_m).bounds()

# -------------------------------
# STEP 4: Load Sentinel-2 SR (cloud-masked) - ORIGINAL CODE UNCHANGED
# -------------------------------
def mask_s2_clouds(img):
    qa = img.select('MSK_CLDPRB')
    return img.updateMask(qa.lt(5))  # only clear pixels

collection = (
    ee.ImageCollection("COPERNICUS/S2_SR")
    .filterBounds(aoi)
    .filterDate("2024-01-01", "2025-09-01")
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    .map(mask_s2_clouds)
    .sort("CLOUDY_PIXEL_PERCENTAGE")
)

image = collection.first()
if image is None:
    raise Exception("❌ No image found for this AOI and date range")
print("✅ Sentinel-2 image loaded and cloud-masked.")

# -------------------------------
# STEP 5: Calculate indices - ORIGINAL CODE UNCHANGED
# -------------------------------
ndvi = image.normalizedDifference(["B8", "B4"])  # vegetation
mndwi = image.normalizedDifference(["B3", "B11"])  # water (improved)

# True color
rgb = image.visualize(bands=["B4", "B3", "B2"], min=0, max=3000)

# Overlays
veg_overlay = rgb.blend(ndvi.visualize(min=0.2, max=0.8, palette=["000000", "00FF00"]))
water_overlay = rgb.blend(mndwi.visualize(min=0.0, max=0.5, palette=["000000", "0000FF"]))
combined_overlay = rgb.blend(ndvi.visualize(min=0.2, max=0.8, palette=["000000", "00FF00"])) \
                    .blend(mndwi.visualize(min=0.0, max=0.5, palette=["000000", "0000FF"]))

# -------------------------------
# STEP 6: Export high-res 4K images to Google Drive - ORIGINAL CODE UNCHANGED
# -------------------------------
def export_to_drive(img, name):
    # Replace invalid characters
    valid_name = "".join(c if c.isalnum() or c in ".,:;_-" else "_" for c in name)
    task = ee.batch.Export.image.toDrive(
        image=img,
        description=valid_name,
        folder='FRA_Exports',
        fileNamePrefix=valid_name,
        region=aoi,
        scale=2,        # ~2m resolution (high-res)
        maxPixels=1e10
    )
    task.start()
    print(f"🚀 Export task started for {valid_name}. Check Google Drive FRA_Exports folder when finished.")

export_to_drive(rgb, "RGB_")
export_to_drive(veg_overlay, "Vegetation")
export_to_drive(water_overlay, "Water")
export_to_drive(combined_overlay, "Vegetation_&_Water_")

# -------------------------------
# STEP 7: NEW FEATURE - Download images locally (from second code)
# -------------------------------
def download_image(url, filename):
    """Download image from URL and save locally"""
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            filepath = os.path.join(OUTPUT_FOLDER, filename)
            with open(filepath, "wb") as f:
                f.write(response.content)
            print(f"✅ Downloaded locally: {filepath}")
        else:
            print(f"❌ Failed to download {filename}")
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")

# Create image with indices for local download
ndvi_for_download = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
ndwi_for_download = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
image_with_indices = image.addBands(ndvi_for_download).addBands(mndwi.rename('MNDWI')).addBands(ndwi_for_download)

# Different visualization styles for local download
visualizations = {
    "TrueColor": {
        "bands": ['B4', 'B3', 'B2'],
        "min": 0, "max": 3000, "gamma": 1.3
    },
    "FalseColor_Vegetation": {
        "bands": ['B8', 'B4', 'B3'],
        "min": 0, "max": 3000, "gamma": 1.3
    },
    "NDVI_Vegetation": {
        "bands": ['NDVI'],
        "min": 0, "max": 1, "palette": ['brown', 'yellow', 'green']
    },
    "MNDWI_Water": {
        "bands": ['MNDWI'],
        "min": -1, "max": 1, "palette": ['brown', 'blue']
    },
    "NDWI_Water_Alt": {
        "bands": ['NDWI'],
        "min": -1, "max": 1, "palette": ['brown', 'blue']
    }
}

# Generate and download all visualization types
print("\n🌍 Downloading satellite images locally...")
for name, params in visualizations.items():
    url = image_with_indices.getThumbURL({
        "region": roi,
        "scale": 10,
        **params,
        "format": "png"
    })
    filename = f"{name}_local.png"
    download_image(url, filename)

# -------------------------------
# STEP 8: Sample bands locally for stats
# -------------------------------
def sample_band(band, scale=10):
    try:
        arr = band.sample(region=aoi, scale=scale).aggregate_array("nd").getInfo()
        return np.array(arr, dtype=float)
    except Exception as e:
        print(f"⚠️ Warning: Could not sample band. Error: {e}")
        return np.array([])

ndvi_arr = sample_band(ndvi)
mndwi_arr = sample_band(mndwi)

# Stats calculation - ORIGINAL CODE UNCHANGED
def stats(arr, name, threshold=0.2):
    if arr.size == 0:
        print(f"📊 {name} Stats - No data available in AOI")
        return 0.0
    mean_val = np.nanmean(arr)
    max_val = np.nanmax(arr)
    min_val = np.nanmin(arr)
    percent = np.sum(arr > threshold) / len(arr) * 100
    print(f"📊 {name} Stats - Mean: {mean_val:.3f}, Max: {max_val:.3f}, Min: {min_val:.3f}")
    print(f"📊 {name} Area > {threshold} threshold: {percent:.2f}%")
    return percent

veg_percentage = stats(ndvi_arr, "NDVI", 0.2)
water_percentage = stats(mndwi_arr, "MNDWI", 0.0)

# -------------------------------
# STEP 9: Land type classification - ORIGINAL CODE UNCHANGED
# -------------------------------
if veg_percentage > 50:
    land_type = "Dense Vegetation / Forest"
elif veg_percentage > 20:
    land_type = "Cultivated / Sparse Vegetation"
elif veg_percentage > 5:
    land_type = "Some Vegetation / Mixed Land"
else:
    land_type = "Bare / Simple Land"

print("\n🌿 Vegetation Analysis:")
print(f"Vegetation covers approx {veg_percentage:.2f}% of the area → {land_type}")
print(f"Water covers approx {water_percentage:.2f}% of the area")

# -------------------------------
# STEP 10: Optional: Preview locally in high-quality plots - ORIGINAL CODE UNCHANGED
# -------------------------------
def preview_band(arr, title, cmap='viridis'):
    if arr.size == 0:
        print(f"⚠️ No data to preview for {title}. Skipping preview.")
        return
    # Make it a 2D array safely
    side_len = int(np.ceil(np.sqrt(len(arr))))
    padded = np.full(side_len*side_len, np.nan)
    padded[:len(arr)] = arr  # fill with data, rest NaN
    img_2d = padded.reshape((side_len, side_len))
    
    plt.figure(figsize=(6,6))
    plt.imshow(img_2d, cmap=cmap)
    plt.title(title)
    plt.colorbar()
    
    # Save the preview plot to output folder
    plot_path = os.path.join(OUTPUT_FOLDER, f"{title.replace(' ', '_')}.png")
    plt.savefig(plot_path, dpi=150, bbox_inches='tight')
    plt.show()
    print(f"✅ Preview saved: {plot_path}")

preview_band(ndvi_arr, "NDVI Preview", cmap='Greens')
preview_band(mndwi_arr, "MNDWI Preview", cmap='Blues')

print(f"\n🎉 All done! High-res images are exporting to Google Drive and local images saved in: {os.path.abspath(OUTPUT_FOLDER)}")
print("📂 Check the FRA_Exports folder for all local downloads and previews!")