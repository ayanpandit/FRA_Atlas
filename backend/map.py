from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import ee
import os
import numpy as np
import requests
import io
import base64
from datetime import datetime
import gc  # Garbage collector for memory management

# -------------------------------
# Flask App Initialization
# -------------------------------
app = Flask(__name__)
# Updated CORS setup for full frontend/backend compatibility
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"], methods=["GET", "POST", "OPTIONS"], supports_credentials=True)

# -------------------------------
# Earth Engine Initialization
# -------------------------------
EE_PROJECT_ID = "fra-a-472418"  # Your Google Earth Engine project ID
try:
    ee.Initialize(project=EE_PROJECT_ID)
    print("✅ Earth Engine initialized successfully")
except Exception as e:
    print(f"❌ Earth Engine initialization failed: {e}")
    print("Note: Make sure you're authenticated with 'ee.Authenticate()' first")

# -------------------------------
# Output folder for temporary storage
# -------------------------------
OUTPUT_FOLDER = "FRA_Exports"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# -------------------------------
# Helper Functions (Optimized)
# -------------------------------

def mask_s2_clouds(img):
    """Mask clouds in Sentinel-2 imagery for clearer results"""
    qa = img.select('MSK_CLDPRB')
    return img.updateMask(qa.lt(5))  # Keep only clear pixels (cloud probability < 5%)

def calculate_indices(image):
    """
    Calculate vegetation and water indices efficiently
    Returns: Dictionary with NDVI, MNDWI, and NDWI bands
    """
    # NDVI: Normalized Difference Vegetation Index (vegetation detection)
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # MNDWI: Modified Normalized Difference Water Index (water detection - improved)
    mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI')
    
    # NDWI: Normalized Difference Water Index (alternative water detection)
    ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI')
    
    return {'ndvi': ndvi, 'mndwi': mndwi, 'ndwi': ndwi}

def sample_band_optimized(band, region, scale=10, max_pixels=5000):
    """
    Sample band values efficiently with memory management
    Uses lower resolution and pixel limits to reduce processing time
    """
    try:
        # Use reduceRegion for faster sampling with limited pixels
        stats = band.reduceRegion(
            reducer=ee.Reducer.toList(),
            geometry=region,
            scale=scale,
            maxPixels=max_pixels,
            bestEffort=True  # Allow Earth Engine to optimize
        )
        
        arr_list = stats.values().getInfo()
        if arr_list and len(arr_list) > 0:
            arr = np.array(arr_list[0], dtype=float)
            # Remove NaN and infinite values for cleaner statistics
            arr = arr[np.isfinite(arr)]
            return arr
        return np.array([])
    except Exception as e:
        print(f"⚠️ Sampling error: {e}")
        return np.array([])

def calculate_statistics(arr, name, threshold=0.2):
    """
    Calculate comprehensive statistics from index array
    Returns: Dictionary with mean, max, min, and percentage above threshold
    """
    if arr.size == 0:
        return {
            'name': name,
            'mean': None,
            'max': None,
            'min': None,
            'percentage_above_threshold': 0.0,
            'threshold': threshold,
            'status': 'no_data'
        }
    
    mean_val = float(np.nanmean(arr))
    max_val = float(np.nanmax(arr))
    min_val = float(np.nanmin(arr))
    percent = float(np.sum(arr > threshold) / len(arr) * 100)
    
    return {
        'name': name,
        'mean': round(mean_val, 3),
        'max': round(max_val, 3),
        'min': round(min_val, 3),
        'percentage_above_threshold': round(percent, 2),
        'threshold': threshold,
        'status': 'success'
    }

def classify_land_type(veg_percentage, water_percentage):
    """
    Classify land type based on vegetation and water coverage
    Returns: Land type classification string
    """
    if veg_percentage > 50:
        land_type = "Dense Vegetation / Forest"
    elif veg_percentage > 20:
        land_type = "Cultivated / Sparse Vegetation"
    elif veg_percentage > 5:
        land_type = "Some Vegetation / Mixed Land"
    else:
        land_type = "Bare / Simple Land"
    
    # Add water classification if significant
    if water_percentage > 30:
        land_type += " with Significant Water Bodies"
    elif water_percentage > 10:
        land_type += " with Water Features"
    
    return land_type

def download_image_as_base64(url):
    """
    Download image from URL and convert to base64 string
    This allows returning images in JSON response
    """
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            img_base64 = base64.b64encode(response.content).decode('utf-8')
            return img_base64
        return None
    except Exception as e:
        print(f"❌ Image download error: {e}")
        return None

# -------------------------------
# API Endpoint: Analyze Location
# -------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_location():
    """
    Main API endpoint for satellite image analysis
    
    Request JSON format:
    {
        "latitude": 25.76177,
        "longitude": 84.15032,
        "radius": 100
    }
    
    Returns: JSON with statistics, classifications, and image URLs
    """
    try:
        # Parse request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract and validate parameters
        lat = float(data.get('latitude'))
        lon = float(data.get('longitude'))
        radius_m = max(10, float(data.get('radius', 100)))  # Minimum 10m radius
        
        # Validate coordinate ranges
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return jsonify({'error': 'Invalid coordinates. Lat: -90 to 90, Lon: -180 to 180'}), 400
        
        print(f"📍 Processing request for: Lat={lat}, Lon={lon}, Radius={radius_m}m")
        
        # -------------------------------
        # Step 1: Define Area of Interest (AOI)
        # -------------------------------
        # Convert radius to degrees (approximate conversion)
        radius_deg = radius_m / 111320
        min_lat, max_lat = lat - radius_deg, lat + radius_deg
        min_lon, max_lon = lon - radius_deg, lon + radius_deg
        
        # Create rectangular AOI for analysis
        aoi = ee.Geometry.Rectangle([min_lon, min_lat, max_lon, max_lat])
        
        # Create circular ROI for image exports (more precise)
        point = ee.Geometry.Point([lon, lat])
        roi = point.buffer(radius_m).bounds()
        
        # -------------------------------
        # Step 2: Load Sentinel-2 Imagery (Optimized)
        # -------------------------------
        # Filter Sentinel-2 collection with cloud masking
        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR")
            .filterBounds(aoi)
            .filterDate("2024-01-01", "2025-09-01")  # Recent imagery
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))  # Low cloud cover
            .map(mask_s2_clouds)
            .sort("CLOUDY_PIXEL_PERCENTAGE")  # Get clearest image first
        )
        
        image = collection.first()
        
        if image is None:
            return jsonify({
                'error': 'No satellite imagery found',
                'message': 'No cloud-free images available for this location and date range'
            }), 404
        
        # Get image metadata
        image_info = image.getInfo()
        acquisition_date = image_info['properties'].get('system:time_start')
        if acquisition_date:
            acquisition_date = datetime.fromtimestamp(acquisition_date / 1000).strftime('%Y-%m-%d')
        
        # -------------------------------
        # Step 3: Calculate Indices
        # -------------------------------
        indices = calculate_indices(image)
        ndvi = indices['ndvi']
        mndwi = indices['mndwi']
        ndwi = indices['ndwi']
        
        # -------------------------------
        # Step 4: Generate Image URLs (Lightweight thumbnails)
        # -------------------------------
        # These URLs are generated instantly by Earth Engine (no heavy processing)
        image_urls = {
            'true_color': image.select(['B4', 'B3', 'B2']).getThumbURL({
                'region': roi,
                'scale': 10,
                'min': 0,
                'max': 3000,
                'gamma': 1.3,
                'format': 'png'
            }),
            'false_color_vegetation': image.select(['B8', 'B4', 'B3']).getThumbURL({
                'region': roi,
                'scale': 10,
                'min': 0,
                'max': 3000,
                'gamma': 1.3,
                'format': 'png'
            }),
            'ndvi': ndvi.getThumbURL({
                'region': roi,
                'scale': 10,
                'min': 0,
                'max': 1,
                'palette': ['brown', 'yellow', 'green'],
                'format': 'png'
            }),
            'mndwi': mndwi.getThumbURL({
                'region': roi,
                'scale': 10,
                'min': -1,
                'max': 1,
                'palette': ['brown', 'blue'],
                'format': 'png'
            }),
            'ndwi': ndwi.getThumbURL({
                'region': roi,
                'scale': 10,
                'min': -1,
                'max': 1,
                'palette': ['brown', 'blue'],
                'format': 'png'
            })
        }
        
        # -------------------------------
        # Step 5: Sample and Calculate Statistics (Optimized)
        # -------------------------------
        # Use optimized sampling with reduced pixels for faster processing
        ndvi_arr = sample_band_optimized(ndvi, aoi, scale=10, max_pixels=3000)
        mndwi_arr = sample_band_optimized(mndwi, aoi, scale=10, max_pixels=3000)
        
        # Calculate statistics
        ndvi_stats = calculate_statistics(ndvi_arr, "NDVI", threshold=0.2)
        mndwi_stats = calculate_statistics(mndwi_arr, "MNDWI", threshold=0.0)
        
        veg_percentage = ndvi_stats['percentage_above_threshold']
        water_percentage = mndwi_stats['percentage_above_threshold']
        
        # -------------------------------
        # Step 6: Land Classification
        # -------------------------------
        land_type = classify_land_type(veg_percentage, water_percentage)
        
        # -------------------------------
        # Step 7: Prepare Response (Clean JSON)
        # -------------------------------
        response_data = {
            'status': 'success',
            'metadata': {
                'location': {
                    'latitude': lat,
                    'longitude': lon,
                    'radius_meters': radius_m
                },
                'acquisition_date': acquisition_date,
                'processing_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'analysis': {
                'land_classification': land_type,
                'vegetation': {
                    'coverage_percentage': round(veg_percentage, 2),
                    'statistics': ndvi_stats
                },
                'water': {
                    'coverage_percentage': round(water_percentage, 2),
                    'statistics': mndwi_stats
                }
            },
            'images': image_urls
        }
        
        # Clean up memory
        del ndvi_arr, mndwi_arr, image, collection
        gc.collect()
        
        print("✅ Analysis complete")
        return jsonify(response_data), 200
        
    except ValueError as ve:
        return jsonify({'error': 'Invalid input', 'message': str(ve)}), 400
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        return jsonify({'error': 'Processing error', 'message': str(e)}), 500

# -------------------------------
# API Endpoint: Health Check
# -------------------------------
@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify API is running"""
    return jsonify({
        'status': 'healthy',
        'service': 'Earth Engine Analysis API',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200

# -------------------------------
# API Endpoint: Download Image
# -------------------------------
@app.route('/download_image', methods=['POST'])
def download_image():
    """
    Download a specific image type
    
    Request JSON format:
    {
        "image_url": "https://earthengine.googleapis.com/..."
    }
    
    Returns: PNG image file
    """
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'No image_url provided'}), 400
        
        # Download image
        response = requests.get(image_url, timeout=30)
        if response.status_code == 200:
            return send_file(
                io.BytesIO(response.content),
                mimetype='image/png',
                as_attachment=True,
                download_name='satellite_image.png'
            )
        else:
            return jsonify({'error': 'Failed to download image'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Run Flask App
# -------------------------------
if __name__ == '__main__':
    print("🚀 Starting Flask Earth Engine API...")
    print("📡 Server will run on http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  POST /analyze       - Analyze location (requires lat, lon, radius)")
    print("  GET  /health        - Health check")
    print("  POST /download_image - Download specific image")
    
    # Run with threading enabled for better performance
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)