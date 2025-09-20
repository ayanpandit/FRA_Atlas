# FRA NDVI/NDWI Analyzer - Updated Version
import ee
import geemap
import rasterio
import matplotlib.pyplot as plt
import numpy as np
import os

# -------------------------------
# Step 1: Authenticate & Initialize
# -------------------------------
ee.Authenticate()
ee.Initialize(project='fra-a-472418')

# -------------------------------
# Step 2: Define ROI
# -------------------------------
coords = [19.2079, 81.9337, 19.2129, 81.9387]  # Your coordinates
roi = ee.Geometry.Rectangle(coords)

# -------------------------------
# Step 3: Sentinel-2 SR Cloud Masking
# -------------------------------
def mask_s2_sr(image):
    scl = image.select('SCL')
    # Mask clouds: SCL values 3=cloud shadow, 8=cloud
    mask = scl.neq(3).And(scl.neq(8))
    return image.updateMask(mask).divide(10000)

# -------------------------------
# Step 4: Load Image Collection
# -------------------------------
collection = (ee.ImageCollection('COPERNICUS/S2_SR')
              .filterBounds(roi)
              .filterDate('2025-01-01', '2025-09-01')
              .map(mask_s2_sr)
              .sort('CLOUDY_PIXEL_PERCENTAGE'))

image = collection.median().clip(roi)

# -------------------------------
# Step 5: Compute NDVI & NDWI
# -------------------------------
ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
rgb = image.select(['B4', 'B3', 'B2'])

# -------------------------------
# Step 6: Export GeoTIFFs Locally
# -------------------------------
output_folder = "FRA_Exports"
os.makedirs(output_folder, exist_ok=True)

def export_layer_local(layer, name):
    path = os.path.join(output_folder, f"{name}.tif")
    geemap.ee_export_image(layer,
                           filename=path,
                           scale=10,
                           region=roi,
                           file_per_band=False)
    print(f"{name} exported as GeoTIFF: {path}")
    return path

ndvi_tif = export_layer_local(ndvi, "NDVI_layer")
ndwi_tif = export_layer_local(ndwi, "NDWI_layer")
rgb_tif = export_layer_local(rgb, "RGB_layer")

# -------------------------------
# Step 7: Convert GeoTIFF to PNG
# -------------------------------
def tiff_to_png(tif_file, png_file, cmap=None):
    with rasterio.open(tif_file) as src:
        arr = src.read(1)
    plt.figure(figsize=(6,6))
    if cmap:
        plt.imshow(arr, cmap=cmap)
    else:
        plt.imshow(arr)
    plt.colorbar()
    plt.axis('off')
    plt.savefig(png_file, bbox_inches='tight')
    plt.close()
    print(f"{png_file} generated for manual inspection.")

tiff_to_png(ndvi_tif, os.path.join(output_folder,'NDVI_layer.png'), cmap='Greens')
tiff_to_png(ndwi_tif, os.path.join(output_folder,'NDWI_layer.png'), cmap='Blues')
tiff_to_png(rgb_tif, os.path.join(output_folder,'RGB_layer.png'))

# -------------------------------
# Step 8: Compute Statistics
# -------------------------------
def calculate_stats(band):
    stats = band.reduceRegion(
        reducer=ee.Reducer.mean()
        .combine(ee.Reducer.min(), '', True)
        .combine(ee.Reducer.max(), '', True),
        geometry=roi,
        scale=10
    )
    return stats.getInfo()

ndvi_stats = calculate_stats(ndvi)
ndwi_stats = calculate_stats(ndwi)

print("\n--- NDVI Summary ---")
print(ndvi_stats)
print("\n--- NDWI Summary ---")
print(ndwi_stats)

# -------------------------------
# Step 9: Compute % area coverage
# -------------------------------
def compute_area_percent(layer, threshold_low, threshold_high, band_name):
    mask = layer.gte(threshold_low).And(layer.lte(threshold_high))
    area_image = mask.multiply(ee.Image.pixelArea())
    area = area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=roi,
        scale=10
    ).get(band_name).getInfo()
    roi_area = roi.area().getInfo()
    return (area/roi_area)*100

dense_veg = compute_area_percent(ndvi, 0.6, 1.0, 'NDVI')
sparse_veg = compute_area_percent(ndvi, 0.3, 0.6, 'NDVI')
bare_land = compute_area_percent(ndvi, -1, 0.3, 'NDVI')

water_area = compute_area_percent(ndwi, 0, 1, 'NDWI')
dry_area = compute_area_percent(ndwi, -1, 0, 'NDWI')

# -------------------------------
# Step 10: FRA Summary
# -------------------------------
print("\n--- FRA Vegetation & Water Summary ---")
print(f"Vegetation Coverage (%): Dense={dense_veg:.2f}, Sparse={sparse_veg:.2f}, Bare={bare_land:.2f}")
print(f"Water Coverage (%): Water={water_area:.2f}, Dry={dry_area:.2f}")

def interpret_ndvi_value(mean_val):
    if mean_val >= 0.6:
        return "Dense/Healthy Vegetation"
    elif mean_val >= 0.3:
        return "Sparse Vegetation"
    else:
        return "Bare Land/Urban"

def interpret_ndwi_value(mean_val):
    if mean_val > 0:
        return "Water Present"
    else:
        return "Water Scarce or Dry"

print("Overall Vegetation Status:", interpret_ndvi_value(ndvi_stats['NDVI_mean']))
print("Overall Water Status:", interpret_ndwi_value(ndwi_stats['NDWI_mean']))

# -------------------------------
# Step 11: Optional Interactive Map
# -------------------------------
Map = geemap.Map(center=[(coords[0]+coords[2])/2, (coords[1]+coords[3])/2], zoom=16)
Map.addLayer(ndvi, {'min':0, 'max':1, 'palette':['white','green']}, 'NDVI')
Map.addLayer(ndwi, {'min':-1, 'max':1, 'palette':['brown','blue']}, 'NDWI')
Map.addLayer(rgb, {'bands':['B4','B3','B2'], 'min':0,'max':0.3}, 'RGB')
Map.addLayer(roi, {}, 'ROI')
Map
