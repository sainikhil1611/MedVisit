import logging
import re
from typing import Any, Dict, List
import PyPDF2
import io
import docx

logger = logging.getLogger(__name__)


async def extract_text_from_file(content: bytes, filename: str, content_type: str) -> str:
    """
    Extract text from various file formats (PDF, TXT, DOCX).
    """
    text = ""
    
    try:
        if content_type == "application/pdf":
            # Extract from PDF
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        elif content_type == "text/plain":
            # Plain text
            text = content.decode('utf-8')
        
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Extract from DOCX
            doc_file = io.BytesIO(content)
            doc = docx.Document(doc_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {e}")
        raise


def extract_patient_profile(text: str) -> Dict[str, Any]:
    """Extract patient profile information."""
    profile = {}
    
    # Name
    name_patterns = [
        r'(?:Patient|Name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'Name:\s*([^\n]+)',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            profile['name'] = match.group(1).strip()
            break
    
    # Date of Birth
    dob_match = re.search(r'(?:DOB|Date of Birth|Born):\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})', text, re.IGNORECASE)
    if dob_match:
        profile['dob'] = dob_match.group(1)
    
    # Age
    age_match = re.search(r'Age:\s*(\d+)', text, re.IGNORECASE)
    if age_match:
        profile['age'] = int(age_match.group(1))
    
    # Sex/Gender
    sex_match = re.search(r'(?:Sex|Gender):\s*(Male|Female|M|F)', text, re.IGNORECASE)
    if sex_match:
        sex = sex_match.group(1).upper()
        profile['sex'] = 'Male' if sex.startswith('M') else 'Female'
    
    # MRN
    mrn_match = re.search(r'MRN[:\s#-]*([A-Z0-9-]+)', text, re.IGNORECASE)
    if mrn_match:
        profile['mrn'] = mrn_match.group(1)
    
    # Primary Physician
    physician_match = re.search(r'(?:Primary\s+)?Physician:\s*([^\n]+)', text, re.IGNORECASE)
    if physician_match:
        profile['primaryPhysician'] = physician_match.group(1).strip()
    
    # Insurance
    insurance_match = re.search(r'Insurance(?:\s+Provider)?:\s*([^\n]+)', text, re.IGNORECASE)
    if insurance_match:
        profile['insuranceProvider'] = insurance_match.group(1).strip()
    
    # Visit Date
    visit_match = re.search(r'(?:Visit Date|Last Visit):\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})', text, re.IGNORECASE)
    if visit_match:
        profile['lastVisit'] = visit_match.group(1)
    
    return profile


def extract_vital_signs(text: str) -> List[Dict[str, Any]]:
    """Extract vital signs."""
    vitals = []
    
    # Blood Pressure
    bp_patterns = [
        r'Blood\s+Pressure[:\s]+(\d{2,3})/(\d{2,3})\s*mmHg',
        r'BP[:\s]+(\d{2,3})/(\d{2,3})',
    ]
    for pattern in bp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            systolic = int(match.group(1))
            diastolic = int(match.group(2))
            status = "critical" if systolic >= 180 or diastolic >= 120 else \
                     "warning" if systolic >= 140 or diastolic >= 90 else "normal"
            vitals.append({
                "label": "Blood Pressure",
                "value": f"{systolic}/{diastolic}",
                "unit": "mmHg",
                "status": status,
                "icon": "heart"
            })
            break
    
    # Heart Rate
    hr_patterns = [
        r'Heart\s+Rate[:\s]+(\d{2,3})\s*bpm',
        r'HR[:\s]+(\d{2,3})',
    ]
    for pattern in hr_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            hr = int(match.group(1))
            status = "warning" if hr > 100 or hr < 60 else "normal"
            vitals.append({
                "label": "Heart Rate",
                "value": str(hr),
                "unit": "bpm",
                "status": status,
                "icon": "activity"
            })
            break
    
    # Respiratory Rate
    rr_match = re.search(r'Respiratory\s+Rate[:\s]+(\d{1,2})', text, re.IGNORECASE)
    if rr_match:
        rr = int(rr_match.group(1))
        status = "warning" if rr > 20 or rr < 12 else "normal"
        vitals.append({
            "label": "Respiratory Rate",
            "value": str(rr),
            "unit": "breaths/min",
            "status": status,
            "icon": "wind"
        })
    
    # Temperature
    temp_match = re.search(r'Temperature[:\s]+([\d.]+)\s*[°]?F', text, re.IGNORECASE)
    if temp_match:
        temp = float(temp_match.group(1))
        status = "warning" if temp > 100.4 or temp < 97.0 else "normal"
        vitals.append({
            "label": "Temperature",
            "value": str(temp),
            "unit": "°F",
            "status": status,
            "icon": "thermometer"
        })
    
    # BMI
    bmi_match = re.search(r'BMI[:\s]+([\d.]+)', text, re.IGNORECASE)
    if bmi_match:
        bmi = float(bmi_match.group(1))
        status = "warning" if bmi >= 30 or bmi < 18.5 else "normal"
        vitals.append({
            "label": "BMI",
            "value": str(bmi),
            "unit": "kg/m²",
            "status": status,
            "icon": "scale"
        })
    
    # SpO2
    spo2_patterns = [
        r'SpO2[:\s]+(\d{2,3})\s*%',
        r'Oxygen\s+Saturation[:\s]+(\d{2,3})',
    ]
    for pattern in spo2_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            spo2 = int(match.group(1))
            status = "critical" if spo2 < 90 else "warning" if spo2 < 95 else "normal"
            vitals.append({
                "label": "SpO2",
                "value": str(spo2),
                "unit": "%",
                "status": status,
                "icon": "droplets"
            })
            break
    
    return vitals


def extract_icd10_codes(text: str) -> List[Dict[str, str]]:
    """Extract ICD-10 diagnosis codes."""
    codes = []
    
    # Find ICD-10 section
    icd_section = re.search(r'(?:DIAGNOSES|ICD-10|ICD10).*?(?=\n\n|\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
    if icd_section:
        section_text = icd_section.group(0)
        
        # Pattern: code - description - status
        pattern = r'([A-Z]\d{2}(?:\.\d{1,2})?)\s*[–-]\s*([^\n]+?)\s*[–-]\s*(ACTIVE|CHRONIC|RESOLVED)'
        matches = re.finditer(pattern, section_text, re.IGNORECASE)
        
        for match in matches:
            codes.append({
                "code": match.group(1),
                "description": match.group(2).strip(),
                "status": match.group(3).lower()
            })
    
    return codes


def extract_allergies(text: str) -> List[Dict[str, str]]:
    """Extract allergies."""
    allergies = []
    
    # Find allergies section
    allergy_section = re.search(r'ALLERGIES.*?(?=\n\n|\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
    if allergy_section:
        section_text = allergy_section.group(0)
        
        # Pattern: allergen - severity - reaction
        pattern = r'(\d+\.\s*)?([A-Za-z\s]+?)\s*[–-]\s*(MILD|MODERATE|SEVERE).*?Reaction:\s*([^\n]+)'
        matches = re.finditer(pattern, section_text, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            allergies.append({
                "name": match.group(2).strip(),
                "severity": match.group(3).lower(),
                "reaction": match.group(4).strip()
            })
    
    return allergies


def extract_medications(text: str) -> List[Dict[str, str]]:
    """Extract current medications."""
    medications = []
    
    # Find medications section
    med_section = re.search(r'(?:CURRENT\s+)?MEDICATIONS.*?(?=\n\n|\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
    if med_section:
        section_text = med_section.group(0)
        
        # Pattern: name dosage - frequency - status
        pattern = r'(\d+\.\s*)?([A-Za-z]+)\s+([\d.]+\s*mg)\s*[–-]\s*([^\n–-]+?)\s*[–-]\s*(ACTIVE|NEW)'
        matches = re.finditer(pattern, section_text, re.IGNORECASE)
        
        for match in matches:
            medications.append({
                "name": match.group(2).strip(),
                "dosage": match.group(3).strip(),
                "frequency": match.group(4).strip(),
                "status": match.group(5).lower()
            })
    
    return medications


def extract_lab_tests(text: str) -> List[Dict[str, str]]:
    """Extract lab test results."""
    lab_tests = []
    
    # Find lab results section
    lab_section = re.search(r'LABORATORY.*?(?=\n\n|\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
    if lab_section:
        section_text = lab_section.group(0)
        
        # Extract individual tests
        lines = section_text.split('\n')
        for line in lines:
            # Pattern: test name: result (date) - status
            match = re.search(r'(\d+\.\s*)?([A-Za-z0-9\s]+?):\s*([^\(]+)\s*\(([^\)]+)\)\s*[–-]\s*(PENDING|COMPLETED|OVERDUE)', line, re.IGNORECASE)
            if match:
                test_name = match.group(2).strip()
                result = match.group(3).strip()
                date = match.group(4).strip()
                status = match.group(5).lower()
                
                lab_tests.append({
                    "name": test_name,
                    "status": status,
                    "date": date,
                    "result": result if status == "completed" else None,
                    "normalRange": None
                })
    
    return lab_tests


def extract_plan_of_care(text: str) -> List[str]:
    """Extract plan of care items."""
    plan_items = []
    
    # Find plan of care section
    plan_section = re.search(r'PLAN\s+OF\s+CARE.*?(?=\n\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
    if plan_section:
        section_text = plan_section.group(0)
        
        # Extract numbered items
        pattern = r'\d+\.\s*([^\n]+)'
        matches = re.finditer(pattern, section_text)
        
        for match in matches:
            plan_items.append(match.group(1).strip())
    
    return plan_items


def parse_with_patterns(text: str) -> Dict[str, Any]:
    """
    Comprehensive pattern-based parser for medical documents.
    No LLM required - uses regex patterns to extract structured data.
    """
    logger.info("Using pattern-based parser (no LLM required)")
    
    data = {
        "patientProfile": extract_patient_profile(text),
        "vitalSigns": extract_vital_signs(text),
        "icd10Codes": extract_icd10_codes(text),
        "allergies": extract_allergies(text),
        "labTests": extract_lab_tests(text),
        "medications": extract_medications(text),
        "planOfCare": extract_plan_of_care(text)
    }
    
    # Add defaults if empty
    if not data["patientProfile"]:
        data["patientProfile"] = {
            "name": "Unknown Patient",
            "dob": "Unknown",
            "age": 0,
            "sex": "Unknown",
            "mrn": "Unknown",
            "primaryPhysician": "Unknown",
            "insuranceProvider": "Unknown",
            "lastVisit": "Unknown"
        }
    
    logger.info(f"Extracted: {len(data['vitalSigns'])} vitals, {len(data['icd10Codes'])} diagnoses, "
                f"{len(data['medications'])} medications, {len(data['allergies'])} allergies")
    
    return data


async def parse_after_visit_summary(content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
    """
    Main function to parse an after-visit summary document using pattern matching.
    """
    # Step 1: Extract text from the document
    text = await extract_text_from_file(content, filename, content_type)
    
    if not text:
        raise ValueError("Could not extract text from document")
    
    logger.info(f"Extracted {len(text)} characters from {filename}")
    
    # Step 2: Parse with regex/pattern matching
    return parse_with_patterns(text)
