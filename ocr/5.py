import ee
import requests
import os

# Authenticate only first time
# ee.Authenticate()

# Initialize Earth Engine
ee.Initialize(project='fra-a-472418')

# Output directory
output_dir = "satellite_images"
os.makedirs(output_dir, exist_ok=True)

# Coordinates
latitude = 19.207953482337054
longitude = 81.93372083988582
point = ee.Geometry.Point([longitude, latitude])
roi = point.buffer(500).bounds()  # 1 km radius

# Sentinel-2 data
collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filterBounds(roi)
              .filterDate('2025-01-01', '2025-09-01')
              .sort('CLOUDY_PIXEL_PERCENTAGE'))

image = collection.first()

# Visualization styles
visualizations = {
    "TrueColor": {
        "bands": ['B4', 'B3', 'B2'],
        "min": 0, "max": 3000, "gamma": 1.3
    },
    "FalseColor_Vegetation": {
        "bands": ['B8', 'B4', 'B3'],
        "min": 0, "max": 3000, "gamma": 1.3
    },
    "NDVI": {
        "bands": ['NDVI'],
        "min": 0, "max": 1, "palette": ['brown', 'yellow', 'green']
    },
    "NDWI": {
        "bands": ['NDWI'],
        "min": -1, "max": 1, "palette": ['brown', 'blue']
    }
}

# Compute indices
ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
image = image.addBands(ndvi).addBands(ndwi)

# Download function
def download_image(url, filename):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(response.content)
        print(f"✅ Saved: {filepath}")
    else:
        print(f"❌ Failed to download {filename}")

# Generate and download
print("\n🌍 Downloading satellite images...")
for name, params in visualizations.items():
    url = image.getThumbURL({
        "region": roi,
        "scale": 10,
        **params,
        "format": "png"
    })
    filename = f"{name}.png"
    download_image(url, filename)

print("\n🎉 All images saved inside:", os.path.abspath(output_dir))
