import requests

def ocr_image_to_text(image_path, output_txt="land_text.txt"):
    url = "https://ocr43.p.rapidapi.com/v1/results"

    headers = {
        "x-rapidapi-host": "ocr43.p.rapidapi.com",
        "x-rapidapi-key": "7777ffeff9mshd0799107ad0319ep12c4a1jsn3327c27ae414"  # grab your api from "https://rapidapi.com/api4ai-api4ai-default/api/ocr43"
    }

    # Send the image as a file
    with open(image_path, "rb") as f:
        files = {"image": f}  # correct field name
        response = requests.post(url, headers=headers, files=files)

    if response.status_code == 200:
        result = response.json()

        # Extract text from API response
        text = ""
        try:
            for item in result.get("results", []):
                for entity in item.get("entities", []):
                    for obj in entity.get("objects", []):
                        for ent in obj.get("entities", []):
                            text += ent.get("text", "") + "\n"
        except Exception:
            text = str(result)

        # Save to file
        with open(output_txt, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"✅ OCR text extracted and saved to {output_txt}")
    else:
        print("❌ Error:", response.text)


# ---------------- DEMO ----------------
if __name__ == "__main__":
    ocr_image_to_text("image.png", "land_text.txt")
