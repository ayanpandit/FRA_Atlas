import requests
import json
import random
from google import genai

# =========================
# 1. OCR Function
# =========================
def ocr_image_to_text(image_path):
    url = "https://ocr43.p.rapidapi.com/v1/results"
    headers = {
        "x-rapidapi-host": "ocr43.p.rapidapi.com",
        "x-rapidapi-key": "YOUR_RAPIDAPI_KEY"
    }

    with open(image_path, "rb") as f:
        files = {"image": f}
        response = requests.post(url, headers=headers, files=files)

    if response.status_code == 200:
        result = response.json()
        text = ""
        try:
            # Flatten OCR results dynamically
            for item in result.get("results", []):
                for entity in item.get("entities", []):
                    for obj in entity.get("objects", []):
                        for ent in obj.get("entities", []):
                            text += ent.get("text", "") + "\n"
        except Exception:
            text = str(result)
        return text.strip()
    else:
        print("❌ OCR Error:", response.text)
        return ""

# =========================
# 2. Gemini API call
# =========================
def refine_with_gemini(text, gemini_api_key):
    client = genai.Client(api_key=gemini_api_key)
    try:
        prompt = (
            "Extract structured data from this text dynamically. "
            "Return a JSON with fields: patta_id, holder_name, category, village, district, state, "
            "coordinates, area_hectares, right_type. "
            "If any field is missing, use null. Ensure accurate extraction even if fields are at different places.\n\n"
            f"Text:\n{text}"
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[{"text": prompt}]
        )

        # response.text contains JSON string
        refined_data = json.loads(response.text)
        return refined_data

    except Exception as e:
        print("❌ Gemini API Error:", e)
        return None

# =========================
# 3. Fallback dynamic extraction (if Gemini fails)
# =========================
def fallback_parse_dynamic(text):
    data = {
        "patta_id": None,
        "holder_name": None,
        "category": None,
        "village": None,
        "district": None,
        "state": None,
        "coordinates": None,
        "area_hectares": None,
        "right_type": None
    }

    # Dynamically search for common patterns
    import re

    # Coordinates
    coords = re.findall(r"\[([0-9\.\-]+),\s*([0-9\.\-]+)\]", text)
    if coords:
        data["coordinates"] = [float(coords[0][0]), float(coords[0][1])]

    # Patta / Khasra ID (any numeric or alphanumeric pattern with /)
    patta = re.findall(r"(?:Patta|Khasra|Compartment).*?([\w/]+)", text, re.I)
    if patta:
        data["patta_id"] = patta[0]

    # Holder name (look for 'Community of' or first capitalized words after "Name")
    holder = re.findall(r"Community of\s*([A-Z][\w\s]+)", text)
    if holder:
        data["holder_name"] = holder[0]

    # Village (look near Gram Sabha/Panchayat)
    village = re.findall(r"Village/Gram Sabha\s*\n([A-Z][\w\s]+)", text)
    if village:
        data["village"] = village[0]
    else:
        if data["holder_name"]:
            data["village"] = data["holder_name"]

    # District (look near 'District' word)
    district = re.findall(r"District\s*\n([A-Z][\w\s]+)", text)
    if district:
        data["district"] = district[0]

    # State (look for common states dynamically)
    states = ["Madhya Pradesh","Odisha","Chhattisgarh","Jharkhand","Uttar Pradesh","Maharashtra"]
    for state in states:
        if state in text:
            data["state"] = state
            break

    # Category / Right type
    category = re.findall(r"(Scheduled Tribes Community|ST|OTFD|Both|Tribe)", text, re.I)
    if category:
        data["category"] = data["right_type"] = category[0]

    # Auto-generate Patta ID with state prefix if missing format
    if data["patta_id"] and data.get("state"):
        prefix = "".join([w[0] for w in data["state"].split()]).upper()
        data["patta_id"] = f"{prefix}-{random.randint(100,999)}"

    return data

# =========================
# 4. Main pipeline
# =========================
def process_document(image_path, gemini_api_key):
    text = ocr_image_to_text(image_path)
    print("\n--- OCR TEXT ---\n")
    print(text)

    # First try Gemini API
    refined_data = refine_with_gemini(text, gemini_api_key)

    if refined_data and isinstance(refined_data, dict) and refined_data != {}:
        print("\n--- STRUCTURED JSON (Gemini) ---\n")
        print(json.dumps(refined_data, indent=4))
    else:
        # Fallback dynamic parsing
        print("⚠️ Using fallback dynamic extraction")
        fallback_data = fallback_parse_dynamic(text)
        print("\n--- STRUCTURED JSON (Fallback) ---\n")
        print(json.dumps(fallback_data, indent=4))

# =========================
# 5. Run
# =========================
if __name__ == "__main__":
    GEMINI_API_KEY = "AIzaSyDERa-Wnyc7GttjFF_e8alede5L4m_79YU"
    IMAGE_PATH = "image.png"  # replace with your image path
    process_document(IMAGE_PATH, GEMINI_API_KEY)
