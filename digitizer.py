# digitizer.py - (Continuing from previous version)

import pytesseract
from PIL import Image
import fitz # PyMuPDF
import os
import io
from dotenv import load_dotenv

import spacy
import re

# --- NEW IMPORTS FOR DATABASE INTERACTION ---
from database import get_db, FRAClaim, Village, Asset, Scheme # Import your models and get_db
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import asyncio # For running async database operations
from datetime import date # For parsing dates
# --------------------------------------------

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH", "tesseract")

try:
    nlp = spacy.load("en_core_web_sm")
    print("SpaCy 'en_core_web_sm' model loaded successfully.")
except Exception as e:
    print(f"Error loading SpaCy model: {e}")
    print("Please ensure you have installed it: python -m spacy download en_core_web_sm")
    nlp = None


# --- EXISTING OCR FUNCTION (UNCHANGED) ---
def process_pdf_for_ocr(pdf_path):
    full_text = ""
    try:
        doc = fitz.open(pdf_path)
        print(f"Processing {doc.page_count} pages from {os.path.basename(pdf_path)}...")

        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(img, lang='eng')
            full_text += text + "\n"
            print(f" - Page {page_num + 1} processed.")

        print(f"Total text extracted from {os.path.basename(pdf_path)}.")
        return full_text
    except pytesseract.TesseractNotFoundError:
        print(f"Error: Tesseract is not installed or not found in PATH for {pdf_path}.")
        print("Please ensure Tesseract-OCR is installed and configured correctly.")
        print("If on Windows, set TESSERACT_PATH in your .env file (e.g., TESSERACT_PATH=C:\\Program Files\\Tesseract-OCR\\tesseract.exe).")
        return None
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
        return None


# --- EXISTING NER FUNCTION (UNCHANGED) ---
def extract_fra_entities(text):
    entities = {}

    holder_name_match = re.search(r'(?:Holder\s*Name|Claimant\s*Details)\s*:\s*([A-Za-z\s.]+)', text, re.IGNORECASE)
    if holder_name_match:
        entities['holder_name'] = holder_name_match.group(1).strip()

    village_name_match = re.search(r'(?:Village\s*Name|Village)\s*:\s*([A-Za-z\s.]+)', text, re.IGNORECASE)
    if village_name_match:
        entities['village_name'] = village_name_match.group(1).strip()

    claim_id_match = re.search(r'Claim\s*ID\s*:\s*([A-Za-z0-9\/]+)', text, re.IGNORECASE)
    if claim_id_match:
        entities['claim_id'] = claim_id_match.group(1).strip()

    district_match = re.search(r'District\s*:\s*([A-Za-z\s.]+)', text, re.IGNORECASE)
    if district_match:
        entities['district'] = district_match.group(1).strip()

    state_match = re.search(r'State\s*:\s*([A-Za-z\s.]+)', text, re.IGNORECASE)
    if state_match:
        entities['state'] = state_match.group(1).strip()

    claim_date_match = re.search(r'(?:Date of Application|Claim Date)\s*:\s*(\d{4}-\d{2}-\d{2})', text, re.IGNORECASE)
    if claim_date_match:
        entities['claim_date'] = claim_date_match.group(1).strip()

    return entities

# --- MAIN ASYNCHRONOUS DIGITIZATION PROCESS ---
async def main_digitization_process():
    documents_path = os.path.join(os.getcwd(), 'scanned_documents')
    if not os.path.exists(documents_path):
        print(f"Error: The directory '{documents_path}' does not exist.")
        return

    print("\n--- Starting OCR for PDF documents ---")
    pdf_files_to_process = [f for f in os.listdir(documents_path) if f.lower().endswith(".pdf")]

    if not pdf_files_to_process:
        print(f"No PDF files found in '{documents_path}'. Please add some documents to process.")
        return

    async for session in get_db(): # Get an asynchronous database session
        for filename in pdf_files_to_process:
            pdf_full_path = os.path.join(documents_path, filename)
            print(f"\n--- Processing: {filename} ---")

            # Step 1: OCR Text Extraction
            extracted_text = process_pdf_for_ocr(pdf_full_path)

            if extracted_text:
                # Save extracted text to a .txt file
                output_filename_txt = f"{os.path.splitext(filename)[0]}.txt"
                output_path_txt = os.path.join(documents_path, output_filename_txt)
                with open(output_path_txt, "w", encoding="utf-8") as f:
                    f.write(extracted_text)
                print(f"Extracted text saved to: {output_path_txt}")

                # Step 2: NER Entity Extraction
                extracted_data = extract_fra_entities(extracted_text)
                print(f"Extracted Entities for {filename}:")
                for key, value in extracted_data.items():
                    print(f"  - {key}: {value}")

                # Step 3: Database Insertion
                if 'claim_id' in extracted_data and 'village_name' in extracted_data:
                    try:
                        # 3.1: Find or Create Village
                        village_name = extracted_data['village_name']
                        stmt = select(Village).filter(Village.name == village_name)
                        result = await session.execute(stmt)
                        village = result.scalar_one_or_none()

                        if not village:
                            print(f"Village '{village_name}' not found in DB. Creating new entry.")
                            village = Village(
                                name=village_name,
                                district=extracted_data.get('district', 'Unknown'),
                                state=extracted_data.get('state', 'Unknown')
                                # population and geometry can be updated later if data exists
                            )
                            session.add(village)
                            await session.flush() # Flush to assign an ID to the new village

                        # 3.2: Create or Update FRAClaim
                        claim_id = extracted_data['claim_id']
                        stmt = select(FRAClaim).filter(FRAClaim.claim_id == claim_id)
                        result = await session.execute(stmt)
                        existing_claim = result.scalar_one_or_none()

                        if existing_claim:
                            print(f"Claim ID '{claim_id}' already exists. Skipping insertion for this document.")
                        else:
                            print(f"Creating new FRAClaim for {claim_id}.")
                            claim_date_str = extracted_data.get('claim_date')
                            claim_date_obj = date.fromisoformat(claim_date_str) if claim_date_str else None

                            new_claim = FRAClaim(
                                holder_name=extracted_data.get('holder_name', 'Unknown Holder'),
                                claim_id=claim_id,
                                status="Digitized", # Status updated to reflect successful digitization
                                claim_date=claim_date_obj,
                                document_path=pdf_full_path, # Path to the original PDF
                                village_id=village.id,
                                # Geometry would be added later in a separate GIS processing step
                            )
                            session.add(new_claim)
                            await session.commit()
                            print(f"Successfully digitized and saved data for Claim ID: {claim_id} ({extracted_data.get('holder_name', 'Unknown Holder')})")

                    except IntegrityError:
                        await session.rollback()
                        print(f"Database IntegrityError for {filename}. Rolled back transaction.")
                    except Exception as e:
                        await session.rollback()
                        print(f"An unexpected error occurred while saving {filename} to DB: {e}")
                else:
                    print(f"Skipping database save for {filename}: Missing 'claim_id' or 'village_name'.")
            else:
                print(f"Skipping NER and DB save for {filename} due to OCR failure.")

    print("\n--- Full Digitization Process Complete ---")

if __name__ == "__main__":
    asyncio.run(main_digitization_process())