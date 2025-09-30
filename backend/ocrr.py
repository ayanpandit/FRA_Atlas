import requests
import json
import google.generativeai as genai
import spacy

# ==================== API KEYS ====================
RAPIDAPI_KEY = "77e2bceb1dmsh261808224f18a22p123c56jsn415616875749"   # your api from "https://rapidapi.com/api4ai-api4ai-default/api/ocr43"
GEMINI_API_KEY = "AIzaSyBvFxk259IrwjvA12ym-ONBfoKfhSjHKCs"

genai.configure(api_key=GEMINI_API_KEY)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("📦 Installing spaCy model (one-time setup)...")
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


# ==================== STEP 1: OCR ====================
def ocr_extract(image_path):
    """Extract text from image using OCR API"""
    url = "https://ocr43.p.rapidapi.com/v1/results"
    headers = {
        "x-rapidapi-host": "ocr43.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY
    }
    
    print("🔍 Running OCR...")
    with open(image_path, "rb") as f:
        files = {"image": f}
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
        
        print(f"✅ OCR complete: {len(text)} characters\n")
        return text.strip()
    else:
        print(f"❌ OCR failed: {response.text}")
        return ""


# ==================== STEP 2: GEMINI EXTRACTION ====================
def gemini_extract(ocr_text):
    """Extract structured data using Gemini AI"""
    prompt = f"""
Extract data from this Indian land record document.

Return ONLY valid JSON (no markdown, no extra text):
{{
    "holder_name": "person/community name",
    "village": "village name",
    "district": "district name",
    "state": "state name",
    "category": "category (ST/SC/OTFD/Both/etc)",
    "right_type": "right type (OTFD/Both/Community Rights/etc)",
    "coordinates": [latitude, longitude] or null
}}

Text:
{ocr_text}
"""
    
    print("🤖 Processing with Gemini AI...")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # Clean markdown
        if "```" in result:
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:].strip()
        
        data = json.loads(result)
        print("✅ Gemini extraction complete\n")
        return data
    
    except Exception as e:
        print(f"❌ Gemini error: {e}\n")
        return {
            "holder_name": None,
            "village": None,
            "district": None,
            "state": None,
            "category": None,
            "right_type": None,
            "coordinates": None
        }


# ==================== STEP 3: SPACY NER REFINEMENT ====================
def spacy_ner_refine(ocr_text, data):
    """Refine extraction using spaCy NER (free, local)"""
    print("🔬 Refining with spaCy NER...")
    
    try:
        doc = nlp(ocr_text[:1000])
        
        persons = []
        locations = []
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                persons.append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                locations.append(ent.text)
        
        # Enhance missing fields
        if not data["holder_name"] and persons:
            data["holder_name"] = persons[0]
        
        if not data["village"] and locations:
            data["village"] = locations[0]
        
        if not data["district"] and len(locations) > 1:
            data["district"] = locations[1]
        
        if not data["state"] and len(locations) > 2:
            data["state"] = locations[2]
        
        print("✅ NER refinement complete\n")
    
    except Exception as e:
        print(f"⚠️ NER error: {e}\n")
    
    return data


# ==================== MAIN PIPELINE ====================
def extract_land_data(image_path):
    """Complete extraction pipeline: OCR → Gemini → spaCy NER"""
    print("=" * 60)
    print("🚀 LAND DOCUMENT EXTRACTOR")
    print("=" * 60 + "\n")
    
    # Step 1: OCR
    ocr_text = ocr_extract(image_path)
    if not ocr_text:
        print("❌ No text extracted")
        return
    
    # Step 2: Gemini extraction
    data = gemini_extract(ocr_text)
    
    # Step 3: spaCy NER refinement
    final_data = spacy_ner_refine(ocr_text, data)
    
    # Output JSON
    print("=" * 60)
    print("📊 FINAL EXTRACTED DATA")
    print("=" * 60)
    print(json.dumps(final_data, indent=2, ensure_ascii=False))
    print("=" * 60)
    
    return final_data


# ==================== RUN ====================
if __name__ == "__main__":
    extract_land_data("image.png")