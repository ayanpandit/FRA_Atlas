import cv2
import numpy as np
import easyocr
from PIL import Image
import gc
import logging
from contextlib import contextmanager
from typing import Tuple, List, Optional
import os
from concurrent.futures import ThreadPoolExecutor
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OptimizedOCRPipeline:
    """
    High-performance OCR pipeline with memory management and optimization
    """
    
    def __init__(self, languages=['en'], gpu=False, max_workers=2):
        self.languages = languages
        self.gpu = gpu
        self.max_workers = max_workers
        self._reader = None
        self._lock = threading.Lock()
    
    @property
    def reader(self):
        """Lazy initialization of EasyOCR reader"""
        if self._reader is None:
            with self._lock:
                if self._reader is None:
                    self._reader = easyocr.Reader(self.languages, gpu=self.gpu, verbose=False)
        return self._reader
    
    @contextmanager
    def memory_cleanup(self):
        """Context manager for automatic memory cleanup"""
        try:
            yield
        finally:
            gc.collect()
    
    def preprocess_image_optimized(self, image: np.ndarray, target_height: int = 800) -> np.ndarray:
        """
        Optimized preprocessing with adaptive resizing and minimal memory usage
        """
        with self.memory_cleanup():
            # Calculate optimal resize factor based on image size
            height, width = image.shape[:2]
            if height > target_height:
                scale_factor = target_height / height
                new_width = int(width * scale_factor)
                image = cv2.resize(image, (new_width, target_height), interpolation=cv2.INTER_AREA)
            
            # Convert to grayscale if not already
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # Optimized denoising - use bilateral filter for better text preservation
            denoised = cv2.bilateralFilter(gray, 5, 50, 50)
            
            # Adaptive contrast enhancement using CLAHE
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
            
            # Optimized sharpening
            kernel = np.array([[-1,-1,-1],[-1,9,-1],[-1,-1,-1]], dtype=np.float32)
            sharpened = cv2.filter2D(enhanced, -1, kernel)
            
            # Adaptive thresholding with optimized parameters
            binary = cv2.adaptiveThreshold(
                sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            return binary
    
    def detect_and_correct_skew(self, image: np.ndarray, max_angle: float = 30.0) -> np.ndarray:
        """
        Fast skew detection and correction using probabilistic Hough transform
        """
        with self.memory_cleanup():
            # Use edges for better line detection
            edges = cv2.Canny(image, 50, 150, apertureSize=3)
            
            # Probabilistic Hough Line Transform - faster than standard
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, 
                                   minLineLength=100, maxLineGap=10)
            
            if lines is None:
                return image
            
            # Calculate angles and find median
            angles = []
            for line in lines[:50]:  # Limit to first 50 lines for speed
                x1, y1, x2, y2 = line[0]
                if x2 - x1 != 0:
                    angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
                    if abs(angle) < max_angle:
                        angles.append(angle)
            
            if not angles:
                return image
            
            # Use median angle for robustness
            skew_angle = np.median(angles)
            
            # Rotate image
            if abs(skew_angle) > 0.5:  # Only rotate if significant skew
                height, width = image.shape
                center = (width // 2, height // 2)
                rotation_matrix = cv2.getRotationMatrix2D(center, skew_angle, 1.0)
                
                # Calculate new dimensions to avoid cropping
                cos_angle = abs(rotation_matrix[0, 0])
                sin_angle = abs(rotation_matrix[0, 1])
                new_width = int((height * sin_angle) + (width * cos_angle))
                new_height = int((height * cos_angle) + (width * sin_angle))
                
                # Adjust translation
                rotation_matrix[0, 2] += (new_width - width) / 2
                rotation_matrix[1, 2] += (new_height - height) / 2
                
                corrected = cv2.warpAffine(image, rotation_matrix, (new_width, new_height),
                                         flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                                         borderValue=255)
                return corrected
            
            return image
    
    def extract_text_regions(self, image: np.ndarray) -> List[Tuple[np.ndarray, Tuple]]:
        """
        Extract text regions using MSER for faster processing
        """
        with self.memory_cleanup():
            try:
                # Try newer OpenCV parameter names first
                mser = cv2.MSER_create(
                    min_area=100, max_area=10000, max_variation=0.25
                )
            except TypeError:
                try:
                    # Fallback to older parameter names
                    mser = cv2.MSER_create(
                        _min_area=100, _max_area=10000, _max_variation=0.25
                    )
                except TypeError:
                    # If MSER fails, return full image as single region
                    logger.warning("MSER not available, processing full image")
                    return [(image, (0, 0, image.shape[1], image.shape[0]))]
            
            try:
                regions, boxes = mser.detectRegions(image)
                
                if not boxes or len(boxes) == 0:
                    return [(image, (0, 0, image.shape[1], image.shape[0]))]
                
                # Convert boxes to standard format if needed
                if len(boxes) > 0 and hasattr(boxes[0], '__len__') and len(boxes[0]) == 4:
                    # Boxes are already in (x, y, w, h) format
                    merged_boxes = self._merge_boxes(boxes)
                else:
                    # Convert from other formats if necessary
                    merged_boxes = []
                    for box in boxes:
                        if hasattr(box, '__len__') and len(box) >= 4:
                            merged_boxes.append(box[:4])
                    merged_boxes = self._merge_boxes(merged_boxes) if merged_boxes else []
                
                # Extract regions
                text_regions = []
                for box in merged_boxes:
                    if len(box) >= 4:
                        x, y, w, h = box[0], box[1], box[2], box[3]
                        # Add padding
                        pad = 10
                        x1 = max(0, int(x - pad))
                        y1 = max(0, int(y - pad))
                        x2 = min(image.shape[1], int(x + w + pad))
                        y2 = min(image.shape[0], int(y + h + pad))
                        
                        if x2 > x1 and y2 > y1:
                            region = image[y1:y2, x1:x2]
                            if region.size > 0:
                                text_regions.append((region, (x1, y1, x2-x1, y2-y1)))
                
                return text_regions if text_regions else [(image, (0, 0, image.shape[1], image.shape[0]))]
                
            except Exception as e:
                logger.warning(f"MSER detection failed: {e}, processing full image")
                return [(image, (0, 0, image.shape[1], image.shape[0]))]
    
    def _merge_boxes(self, boxes: List, overlap_threshold: float = 0.3) -> List:
        """Merge overlapping bounding boxes"""
        if not boxes or len(boxes) == 0:
            return []
        
        # Convert boxes to consistent format
        converted_boxes = []
        for box in boxes:
            if hasattr(box, '__len__') and len(box) >= 4:
                # Ensure we have integers
                x, y, w, h = int(box[0]), int(box[1]), int(box[2]), int(box[3])
                converted_boxes.append([x, y, w, h])
        
        if not converted_boxes:
            return []
        
        merged = []
        boxes_sorted = sorted(converted_boxes, key=lambda x: x[1])  # Sort by y-coordinate
        
        current_box = list(boxes_sorted[0])
        
        for box in boxes_sorted[1:]:
            # Check if boxes overlap
            if self._calculate_overlap(current_box, box) > overlap_threshold:
                # Merge boxes
                current_box[0] = min(current_box[0], box[0])
                current_box[1] = min(current_box[1], box[1])
                current_box[2] = max(current_box[0] + current_box[2], box[0] + box[2]) - current_box[0]
                current_box[3] = max(current_box[1] + current_box[3], box[1] + box[3]) - current_box[1]
            else:
                merged.append(tuple(current_box))
                current_box = list(box)
        
        merged.append(tuple(current_box))
        return merged
    
    def _calculate_overlap(self, box1: List, box2: List) -> float:
        """Calculate overlap ratio between two boxes"""
        x1_1, y1_1, w1, h1 = box1
        x2_1, y2_1 = x1_1 + w1, y1_1 + h1
        
        x1_2, y1_2, w2, h2 = box2
        x2_2, y2_2 = x1_2 + w2, y1_2 + h2
        
        # Calculate intersection
        xi1 = max(x1_1, x1_2)
        yi1 = max(y1_1, y1_2)
        xi2 = min(x2_1, x2_2)
        yi2 = min(y2_1, y2_2)
        
        if xi2 <= xi1 or yi2 <= yi1:
            return 0
        
        intersection = (xi2 - xi1) * (yi2 - yi1)
        union = w1 * h1 + w2 * h2 - intersection
        
        return intersection / union if union > 0 else 0
    
    def parallel_ocr(self, text_regions: List[Tuple[np.ndarray, Tuple]]) -> List[Tuple]:
        """
        Process text regions in parallel for better performance
        """
        def process_region(region_data):
            region, bbox = region_data
            try:
                results = self.reader.readtext(region, detail=1, paragraph=False)
                # Adjust coordinates to global image space
                adjusted_results = []
                for detection in results:
                    coords, text, confidence = detection
                    adjusted_coords = [
                        [coord[0] + bbox[0], coord[1] + bbox[1]] for coord in coords
                    ]
                    adjusted_results.append((adjusted_coords, text, confidence))
                return adjusted_results
            except Exception as e:
                logger.error(f"Error processing region: {e}")
                return []
        
        all_results = []
        if len(text_regions) > 1 and self.max_workers > 1:
            # Use threading for I/O bound OCR operations
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = [executor.submit(process_region, region) for region in text_regions]
                for future in futures:
                    try:
                        results = future.result(timeout=30)  # 30 second timeout
                        all_results.extend(results)
                    except Exception as e:
                        logger.error(f"Error in parallel processing: {e}")
        else:
            # Process sequentially for small number of regions
            for region in text_regions:
                results = process_region(region)
                all_results.extend(results)
        
        return all_results
    
    def smart_text_reconstruction(self, results: List[Tuple]) -> Tuple[str, float]:
        """
        Intelligent text reconstruction with improved ordering and confidence calculation
        """
        if not results:
            return "", 0.0
        
        # Filter low-confidence results
        min_confidence = 0.3
        filtered_results = [(bbox, text, conf) for bbox, text, conf in results if conf >= min_confidence]
        
        if not filtered_results:
            filtered_results = results  # Fallback to all results
        
        # Sort by reading order (top to bottom, left to right)
        def get_reading_order_key(item):
            bbox, text, conf = item
            # Get top-left corner
            top_left_y = min([point[1] for point in bbox])
            top_left_x = min([point[0] for point in bbox])
            # Group by lines (tolerance for y-coordinate)
            line_group = int(top_left_y // 30)  # Adjust line height tolerance
            return (line_group, top_left_x)
        
        sorted_results = sorted(filtered_results, key=get_reading_order_key)
        
        # Reconstruct text with smart spacing
        full_text = ""
        confidences = []
        prev_line_group = -1
        
        for bbox, text, confidence in sorted_results:
            if not text.strip():
                continue
            
            top_left_y = min([point[1] for point in bbox])
            current_line_group = int(top_left_y // 30)
            
            # Add line break for new line
            if prev_line_group != -1 and current_line_group > prev_line_group:
                full_text += "\n"
            elif full_text and not full_text.endswith(" "):
                full_text += " "
            
            full_text += text.strip()
            confidences.append(confidence)
            prev_line_group = current_line_group
        
        # Calculate weighted confidence
        overall_confidence = (
            sum(conf * len(text) for (_, text, conf) in sorted_results) / 
            sum(len(text) for (_, text, _) in sorted_results)
        ) if sorted_results else 0.0
        
        return full_text.strip(), overall_confidence
    
    def process_image(self, image_path: str, output_file: Optional[str] = None) -> Tuple[str, float]:
        """
        Main processing pipeline with optimizations
        """
        logger.info(f"Processing image: {image_path}")
        
        try:
            # Load image with memory management
            with self.memory_cleanup():
                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"Image file not found: {image_path}")
                
                # Load image
                image = cv2.imread(image_path)
                if image is None:
                    raise ValueError(f"Could not load image: {image_path}")
                
                # Step 1: Preprocessing
                logger.info("Preprocessing image...")
                preprocessed = self.preprocess_image_optimized(image)
                
                # Step 2: Skew correction
                logger.info("Correcting skew...")
                deskewed = self.detect_and_correct_skew(preprocessed)
                
                # Step 3: Extract text regions (optional optimization)
                logger.info("Extracting text regions...")
                text_regions = self.extract_text_regions(deskewed)
                
                # Step 4: Parallel OCR processing
                logger.info("Running OCR...")
                results = self.parallel_ocr(text_regions)
                
                # Step 5: Smart text reconstruction
                logger.info("Reconstructing text...")
                full_text, overall_confidence = self.smart_text_reconstruction(results)
                
                # Step 6: Save results
                if output_file:
                    with open(output_file, "w", encoding="utf-8") as f:
                        f.write(full_text)
                        f.write(f"\n\nOverall Confidence: {overall_confidence:.3f}")
                    logger.info(f"Results saved to {output_file}")
                
                logger.info(f"OCR completed. Confidence: {overall_confidence:.3f}")
                return full_text, overall_confidence
                
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            raise
    
    def cleanup(self):
        """Clean up resources"""
        if self._reader is not None:
            del self._reader
            self._reader = None
        gc.collect()

# -----------------------------
# Usage Functions
# -----------------------------

def process_single_image(image_path: str, output_file: str = "optimized_ocr_output.txt", 
                        languages=['en'], gpu=False) -> Tuple[str, float]:
    """
    Process a single image with the optimized pipeline
    """
    pipeline = OptimizedOCRPipeline(languages=languages, gpu=gpu)
    try:
        return pipeline.process_image(image_path, output_file)
    finally:
        pipeline.cleanup()

def batch_process_images(image_paths: List[str], output_dir: str = "ocr_outputs/", 
                        languages=['en'], gpu=False) -> List[Tuple[str, str, float]]:
    """
    Process multiple images in batch
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    pipeline = OptimizedOCRPipeline(languages=languages, gpu=gpu)
    results = []
    
    try:
        for image_path in image_paths:
            try:
                output_file = os.path.join(output_dir, f"{os.path.basename(image_path)}_ocr.txt")
                text, confidence = pipeline.process_image(image_path, output_file)
                results.append((image_path, text, confidence))
                logger.info(f"Processed {image_path} - Confidence: {confidence:.3f}")
            except Exception as e:
                logger.error(f"Failed to process {image_path}: {e}")
                results.append((image_path, "", 0.0))
    finally:
        pipeline.cleanup()
    
    return results

# -----------------------------
# Main Execution
# -----------------------------

if __name__ == "__main__":
    # Example usage
    image_path = "image.png"  # Replace with your image path
    
    try:
        text, confidence = process_single_image(
            image_path, 
            output_file="optimized_ocr_result.txt",
            languages=['en'],  # Add more languages as needed: ['en', 'hi', 'ur']
            gpu=False  # Set to True if you have GPU support
        )
        
        print("✅ OCR Processing Complete!")
        print(f"📊 Overall Confidence: {confidence:.3f}")
        print(f"📝 Extracted Text Preview:")
        print("-" * 50)
        print(text[:500] + "..." if len(text) > 500 else text)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        logger.error(f"Processing failed: {e}")