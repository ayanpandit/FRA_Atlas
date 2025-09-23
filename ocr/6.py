# FRA NDVI/NDWI Analyzer - PlanetScope PSScene Updated Version
import requests
import json
import os
import time
import rasterio
import numpy as np
import matplotlib.pyplot as plt

# -------------------------------
# Step 1: Settings
# -------------------------------
API_KEY = "PLAKafefd84bd24e4eec9a414a4a543062e8"  # Planet API Key
OUTPUT_FOLDER = "FRA_Exports"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Ballia, UP rectangle coordinates (lon/lat)
coords = [83.5311, 25.5511, 83.5825, 25.5877]

# Date range for PlanetScope imagery
DATE_START = "2024-01-01T00:00:00Z"
DATE_END = "2025-09-01T23:59:59Z"

# -------------------------------
# Step 2: Create AOI polygon
# -------------------------------
def create_geojson_polygon(coords):
    min_lon, min_lat, max_lon, max_lat = coords
    return {
        "type": "Polygon",
        "coordinates": [[
            [min_lon, min_lat],
            [min_lon, max_lat],
            [max_lon, max_lat],
            [max_lon, min_lat],
            [min_lon, min_lat]
        ]]
    }

AOI = create_geojson_polygon(coords)

# -------------------------------
# Step 3: Planet API search (PSScene)
# -------------------------------
def search_planet_images():
    url = "https://api.planet.com/data/v1/quick-search"
    headers = {"Authorization": f"api-key {API_KEY}"}
    
    payload = {
        "item_types": ["PSScene"],
        "filter": {
            "type": "AndFilter",
            "config": [
                {"type": "GeometryFilter", "field_name": "geometry", "config": AOI},
                {"type": "DateRangeFilter", "field_name": "acquired",
                 "config": {"gte": DATE_START, "lte": DATE_END}}
            ]
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        print("❌ Error:", response.status_code, response.text)
        raise Exception("Planet API search failed. Check your query or API key.")
    
    data = response.json()
    print(f"✅ Found {len(data['features'])} PlanetScope PSScene images")
    return data['features']

# -------------------------------
# Step 4: Get first available analytic asset
# -------------------------------
def get_first_available_analytic(features):
    headers = {"Authorization": f"api-key {API_KEY}"}
    for f in features:
        assets_url = f["_links"]["assets"]
        resp = requests.get(assets_url, headers=headers).json()
        if "analytic" in resp:
            asset = resp["analytic"]
            if asset["status"] != "active":
                activate_url = asset["_links"]["activate"]
                requests.post(activate_url, headers=headers)
                print("⏳ Activating asset...")
                time.sleep(5)
            return asset["_links"]["self"]
    raise Exception("❌ No PlanetScope PSScene image with analytic asset found.")

# -------------------------------
# Step 5: Download image
# -------------------------------
def download_image(url, out_path):
    headers = {"Authorization": f"api-key {API_KEY}"}
    r = requests.get(url, headers=headers, stream=True)
    if r.status_code == 200:
        with open(out_path, 'wb') as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        print(f"✅ Downloaded: {out_path}")
    else:
        raise Exception("❌ Download failed", r.status_code, r.text)

# -------------------------------
# Step 6: NDVI & NDWI calculation
# -------------------------------
def compute_ndvi_ndwi(image_path, output_prefix):
    with rasterio.open(image_path) as src:
        img = src.read().astype(float)
        # PlanetScope PSScene 4-band order: B1=B, B2=G, B3=R, B4=NIR
        blue, green, red, nir = img

        ndvi = np.where((nir + red) == 0, 0, (nir - red)/(nir + red))
        ndwi = np.where((green + nir) == 0, 0, (green - nir)/(green + nir))

        meta = src.meta.copy()
        meta.update(count=1, dtype=rasterio.float32)

        ndvi_path = os.path.join(OUTPUT_FOLDER, f"{output_prefix}_NDVI.tif")
        ndwi_path = os.path.join(OUTPUT_FOLDER, f"{output_prefix}_NDWI.tif")

        with rasterio.open(ndvi_path, 'w', **meta) as dst:
            dst.write(ndvi.astype(rasterio.float32), 1)
        with rasterio.open(ndwi_path, 'w', **meta) as dst:
            dst.write(ndwi.astype(rasterio.float32), 1)

        plt.imsave(os.path.join(OUTPUT_FOLDER, f"{output_prefix}_NDVI.png"), ndvi, cmap='Greens')
        plt.imsave(os.path.join(OUTPUT_FOLDER, f"{output_prefix}_NDWI.png"), ndwi, cmap='Blues')

        print(f"✅ NDVI & NDWI computed for {output_prefix}")

# -------------------------------
# Step 7: Main flow
# -------------------------------
features = search_planet_images()
analytic_url = get_first_available_analytic(features)

image_file = os.path.join(OUTPUT_FOLDER, "Ballia_Planet_analytic.tif")
download_image(analytic_url, image_file)

compute_ndvi_ndwi(image_file, "Ballia")

print("🎉 All done! Check the FRA_Exports folder.")
