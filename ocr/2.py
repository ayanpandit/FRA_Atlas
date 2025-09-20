import pytesseract
from pytesseract import Output
import cv2
import numpy as np

# If Windows, specify Tesseract executable path:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(image_path):
    """
    Preprocess image for maximum OCR accuracy:
    - Grayscale
    - Denoise
    - Sharpen
    - Binarize
    - Deskew
    """
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, h=30)

    # Sharpen
    kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    gray = cv2.filter2D(gray, -1, kernel)

    # Binarize
    gray = cv2.adaptiveThreshold(gray, 255,
                                 cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 31, 2)

    # Deskew
    coords = np.column_stack(np.where(gray > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = gray.shape
    center = (w//2, h//2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    gray = cv2.warpAffine(gray, M, (w, h),
                          flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REPLICATE)
    return gray

def run_tesseract_ocr(image_path, output_file="tesseract_output.txt"):
    # Preprocess image
    processed_image = preprocess_image(image_path)

    # Run Tesseract OCR
    custom_config = r'--oem 3 --psm 6'  # OEM 3 = LSTM neural nets, PSM 6 = Assume a uniform block of text
    data = pytesseract.image_to_data(processed_image, output_type=Output.DICT, config=custom_config, lang='eng')

    n_boxes = len(data['text'])
    full_text = ""
    confidences = []

    for i in range(n_boxes):
        text = data['text'][i].strip()
        conf = int(data['conf'][i])
        if text != "":
            full_text += text + " "
            confidences.append(conf)
        # Add line break if new line detected
        if data['line_num'][i] != data['line_num'][i-1] if i>0 else False:
            full_text += "\n"

    overall_confidence = sum(confidences)/len(confidences) if confidences else 0

    # Save to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(full_text.strip())
        f.write(f"\n\nOverall Confidence: {overall_confidence:.2f}")

    print(f"✅ OCR complete! Saved to {output_file}")
    print(f"Overall Confidence: {overall_confidence:.2f}")

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    image_path = "image.png"  # replace with your image
    run_tesseract_ocr(image_path)
