import ee
import geemap
import os

# Authenticate (only needed first time)
ee.Authenticate()

# Initialize with your Cloud Project ID
ee.Initialize(project='fra-a-472418')

# Coordinates
latitude = 19.207953482337054
longitude = 81.93372083988582
point = ee.Geometry.Point([longitude, latitude])

# Define region of interest (ROI) - 1 km buffer
roi = point.buffer(500).bounds()

# Load Sentinel-2 true color (RGB) image
collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filterBounds(roi)
              .filterDate('2025-01-01', '2025-09-01')
              .sort('CLOUDY_PIXEL_PERCENTAGE'))

# Pick least cloudy image
image = collection.first()

# Select RGB bands
rgb = image.select(['B4', 'B3', 'B2'])

# Visualization parameters
vis_params = {
    'min': 0,
    'max': 3000,
    'bands': ['B4', 'B3', 'B2']
}

# Export image as GeoTIFF
out_tif = "satellite_image.tif"
url = rgb.getDownloadURL({
    'scale': 10,
    'region': roi,
    'fileFormat': 'GeoTIFF'
})

print("Download this satellite image (GeoTIFF):", url)
