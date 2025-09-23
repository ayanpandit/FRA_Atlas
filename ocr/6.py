# ----------------------------------------
# FRA NDVI/NDWI Analyzer - PlanetScope Updated
# ----------------------------------------
import requests
import json
import os
import rasterio
import numpy as np
import matplotlib.pyplot as plt

# -------------------------------
# Step 0: Configuration
# -------------------------------
API_KEY = "PLAKafefd84bd24e4eec9a414a4a543062e8"  # Planet API Key
headers = {"Authorization": f"api-key {API_KEY}"}

# Ballia, UP coordinates (rectangle: min_lon, min_lat, max_lon, max_lat)
coords = [83.5810, 25.7480, 83.6310, 25.7980]

output_folder = "Planet_Exports"
os.makedirs(output_folder, exist_ok=True)

# -------------------------------
# Step 1: Define search payload
# -------------------------------
search_payload = {
    "item_types": ["PSScene"],
    "filter": {
        "type": "AndFilter",
        "config": [
            {
                "type": "GeometryFilter",
                "field_name": "geometry",
                "config": {
                    "type": "Polygon",
                    "coordinates": [[
                        [coords[0], coords[1]],
                        [coords[0], coords[3]],
                        [coords[2], coords[3]],
                        [coords[2], coords[1]],
                        [coords[0], coords[1]]
                    ]]
                }
            },
            {
                "type": "DateRangeFilter",
                "field_name": "acquired",
                "config": {
                    "gte": "2025-01-01T00:00:00.000Z",
                    "lte": "2025-09-01T23:59:59.999Z"
                }
            }
        ]
    }
}

# -------------------------------
# Step 2: Search Planet images
# -------------------------------
def search_planet_images():
    search_url = "https://api.planet.com/data/v1/quick-search"
    response = requests.post(search_url, headers=headers, json=search_payload)
    if response.status_code != 200:
        print("❌ Error:", response.text)
        raise Exception("Planet API search failed. Check your query or API key.")
    data = response.json()
    features = data.get("features", [])
    if not features:
        raise Exception("❌ No PlanetScope images found for this area/date.")
    print(f"✅ Found {len(features)} PlanetScope images")
    return features

# -------------------------------
# Step 3: Get first image's analytic URL
# -------------------------------
def get_analytic_url(feature):
    item_type = feature['properties']['item_type']
    item_id = feature['id']
    asset_url = f"https://api.planet.com/data/v1/item-types/{item_type}/items/{item_id}/assets"
    asset_resp = requests.get(asset_url, headers=headers)
    if asset_resp.status_code != 200:
        raise Exception(f"❌ Could not fetch assets: {asset_resp.text}")
    assets = asset_resp.json()

    # Prefer 'analytic', fallback to 'analytic_8b'
    if "analytic" in assets:
        asset_link = assets["analytic"]["location"]
    elif "analytic_8b" in assets:
        asset_link = assets["analytic_8b"]["location"]
    else:
        raise Exception("❌ No suitable analytic asset available for this image.")
    return asset_link

# -------------------------------
# Step 4: Download image
# -------------------------------
def download_image(url, filename):
    print(f"⏳ Downloading image to {filename} ...")
    r = requests.get(url, headers=headers, stream=True)
    if r.status_code != 200:
        raise Exception(f"❌ Failed to download image: {r.text}")
    with open(filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"✅ Image saved: {filename}")

# -------------------------------
# Step 5: Compute NDVI & NDWI
# -------------------------------
def compute_ndvi_ndwi(tif_file):
    with rasterio.open(tif_file) as src:
        b = src.read()
        # PlanetScope PSScene: Band order usually B1=Blue, B2=Green, B3=Red, B4=NIR
        blue = b[0].astype(float)
        green = b[1].astype(float)
        red = b[2].astype(float)
        nir = b[3].astype(float)

    # NDVI = (NIR - RED) / (NIR + RED)
    ndvi = np.where((nir+red)==0., 0, (nir-red)/(nir+red))
    # NDWI = (GREEN - NIR) / (GREEN + NIR)
    ndwi = np.where((green+nir)==0., 0, (green-nir)/(green+nir))
    return ndvi, ndwi

# -------------------------------
# Step 6: Save arrays as PNG
# -------------------------------
def save_png(array, filename, cmap='viridis'):
    plt.figure(figsize=(6,6))
    plt.imshow(array, cmap=cmap)
    plt.colorbar()
    plt.axis('off')
    plt.savefig(filename, bbox_inches='tight')
    plt.close()
    print(f"✅ PNG saved: {filename}")

# -------------------------------
# Step 7: Main workflow
# -------------------------------
features = search_planet_images()
first_feature = features[0]

asset_url = get_analytic_url(first_feature)
tif_path = os.path.join(output_folder, "Planet_image.tif")
download_image(asset_url, tif_path)

ndvi, ndwi = compute_ndvi_ndwi(tif_path)
save_png(ndvi, os.path.join(output_folder, "NDVI.png"), cmap='Greens')
save_png(ndwi, os.path.join(output_folder, "NDWI.png"), cmap='Blues')

print("\n✅ Done! Check the Planet_Exports folder for TIFF and PNG outputs.")
