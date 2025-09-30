from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)

# API Keys from .env
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)


# ==================== OCR ====================
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


# ==================== GEMINI EXTRACTION ====================
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


# ==================== API ENDPOINT ====================
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


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200


@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        "message": "Land Document Extractor API",
        "endpoints": {
            "/extract": "POST - Upload image/PDF to extract data",
            "/health": "GET - Health check"
        }
    }), 200


# ==================== RUN ====================
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)