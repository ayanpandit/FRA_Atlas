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
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# -------------------------------
# Flask App Initialization
# -------------------------------
app = Flask(__name__)
# Updated CORS setup for full frontend/backend compatibility
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"], methods=["GET", "POST", "OPTIONS"], supports_credentials=True)

# -------------------------------
# API Keys Configuration
# -------------------------------
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------
# Output folder for temporary storage
# -------------------------------
OUTPUT_FOLDER = os.getenv("OUTPUT_FOLDER", "FRA_Exports")
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# -------------------------------
# Earth Engine Initialization
# -------------------------------
EE_PROJECT_ID = os.getenv("EE_PROJECT_ID", "fra-a-472418")

def initialize_earth_engine():
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    service_account_json = os.getenv("EE_SERVICE_ACCOUNT_JSON")
    service_account_email = os.getenv("EE_SERVICE_ACCOUNT_EMAIL")

    print("🌐 EE_PROJECT_ID:", EE_PROJECT_ID)

    if credentials_path:
        print(f"📝 GOOGLE_APPLICATION_CREDENTIALS is set to: {credentials_path}")
        print(f"📁 Credential file exists: {os.path.exists(credentials_path)}")
    else:
        print("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set")

    if service_account_json:
        print(f"📄 EE_SERVICE_ACCOUNT_JSON provided (length={len(service_account_json)})")

    if service_account_json and not credentials_path:
        temp_path = os.path.join(OUTPUT_FOLDER, "ee_service_account.json")
        try:
            with open(temp_path, "w", encoding="utf-8") as fh:
                fh.write(service_account_json)
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_path
            credentials_path = temp_path
            print(f"🔐 Wrote Earth Engine credentials to {temp_path}")
            if not service_account_email:
                service_account_email = json.loads(service_account_json).get("client_email")
        except Exception as err:
            print(f"❌ Failed to write EE service account file: {err}")

    if credentials_path and not service_account_email:
        try:
            with open(credentials_path, "r", encoding="utf-8") as fh:
                service_account_email = json.load(fh).get("client_email")
        except Exception as err:
            print(f"⚠️ Unable to read client_email from credentials file: {err}")

    if credentials_path:
        print(f"🔐 Using Earth Engine credentials from {credentials_path}")
    if service_account_email:
        print(f"🆔 Earth Engine service account: {service_account_email}")

    try:
        if credentials_path and service_account_email:
            credentials = ee.ServiceAccountCredentials(service_account_email, credentials_path)
            ee.Initialize(credentials=credentials, project=EE_PROJECT_ID)
        else:
            ee.Initialize(project=EE_PROJECT_ID)
        print("✅ Earth Engine initialized successfully")
    except Exception as e:
        print(f"❌ Earth Engine initialization failed: {e}")
        print("Note: Ensure GOOGLE_APPLICATION_CREDENTIALS / EE_SERVICE_ACCOUNT_JSON and EE_SERVICE_ACCOUNT_EMAIL are set and the service account has Earth Engine access.")

initialize_earth_engine()

# ========================================================================
# EARTH ENGINE ANALYSIS FUNCTIONS
# ========================================================================

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

# ========================================================================
# OCR & DOCUMENT EXTRACTION FUNCTIONS
# ========================================================================

def ocr_extract(image_file):
    """Extract text from image"""
    url = "https://ocr43.p.rapidapi.com/v1/results"
    headers = {
        "x-rapidapi-host": "ocr43.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY
    }
    
    files = {"image": image_file}
    response = requests.post(url, headers=headers, files=files)
    
    if response.status_code == 200:
        result = response.json()
        text = ""
        try:
            for item in result.get("results", []):
                for entity in item.get("entities", []):
                    for obj in entity.get("objects", []):
                        for ent in obj.get("entities", []):
                            text += ent.get("text", "") + "\n"
        except:
            text = str(result)
        return text.strip()
    return ""

def gemini_extract(ocr_text):
    """Extract structured data using Gemini"""
    prompt = f"""
Extract data from this Indian land record document.

Return ONLY valid JSON (no markdown):
{{
    "holder_name": "person/community name",
    "village": "village name",
    "district": "district name",
    "state": "state name",
    "category": "category",
    "right_type": "right type",
    "coordinates": [latitude, longitude] or null
}}

Text: {ocr_text}
"""
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        if "```" in result:
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:].strip()
        
        return json.loads(result)
    except:
        return {
            "holder_name": None,
            "village": None,
            "district": None,
            "state": None,
            "category": None,
            "right_type": None,
            "coordinates": None
        }

# ========================================================================
# API ENDPOINTS - EARTH ENGINE ANALYSIS
# ========================================================================

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

# ========================================================================
# API ENDPOINTS - DOCUMENT EXTRACTION
# ========================================================================

@app.route('/extract', methods=['POST'])
def extract():
    """Main endpoint to extract land document data"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    try:
        # Step 1: OCR
        ocr_text = ocr_extract(file)
        
        if not ocr_text:
            return jsonify({"error": "OCR extraction failed"}), 500
        
        # Step 2: Gemini extraction
        data = gemini_extract(ocr_text)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================================================
# API ENDPOINTS - GENERAL
# ========================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify API is running"""
    return jsonify({
        'status': 'healthy',
        'service': 'Combined Earth Engine & Document Extraction API',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'services': {
            'earth_engine': 'active',
            'document_extraction': 'active'
        }
    }), 200

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API documentation"""
    return jsonify({
        "message": "Combined Land Analysis API",
        "version": "2.0",
        "endpoints": {
            "/analyze": "POST - Analyze location with satellite imagery (lat, lon, radius)",
            "/extract": "POST - Upload image/PDF to extract land document data",
            "/download_image": "POST - Download specific satellite image",
            "/health": "GET - Health check"
        }
    }), 200

# ========================================================================
# RUN FLASK APP
# ========================================================================

if __name__ == '__main__':
    print("🚀 Starting Combined Flask API Server...")
    print("📡 Server will run on http://localhost:5000")
    print("\n" + "="*60)
    print("Available endpoints:")
    print("  POST /analyze        - Satellite image analysis")
    print("  POST /extract        - Document data extraction")
    print("  POST /download_image - Download satellite images")
    print("  GET  /health         - Health check")
    print("  GET  /               - API documentation")
    print("="*60 + "\n")
    
    port = int(os.getenv("PORT", 5000))
    # Run with threading enabled for better performance
    app.run(debug=True, host='0.0.0.0', port=port, threaded=True)