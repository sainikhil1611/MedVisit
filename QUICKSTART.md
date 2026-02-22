# Quick Start Guide - Document Upload Feature

## What Was Added

✅ **Backend (FastAPI)**
- New router: `routers/document.py` - Handles document upload and retrieval
- New service: `services/document_parser.py` - Extracts medical data using AI
- API endpoints:
  - `POST /api/document/upload` - Upload and parse documents
  - `GET /api/document/latest` - Retrieve last uploaded document data

✅ **Frontend (React)**
- New component: `DocumentUpload.tsx` - Drag-and-drop document upload UI
- Updated `Dashboard.tsx` - Now uses state and updates from uploaded documents
- Updated `api.ts` - Added document upload API functions

## How to Use

### 1. Install Backend Dependencies
```bash
cd backend/twelvelabs
pip install -r requirements.txt
```

### 2. Add Gemini API Key
Create or update `backend/twelvelabs/.env`:
```
GEMINI_API_KEY=your_key_here
```

Get a free API key at: https://makersuite.google.com/app/apikey

### 3. Start Servers
```bash
# Terminal 1 - Backend
cd backend/twelvelabs
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
npm run dev
```

### 4. Upload a Document
1. Navigate to http://localhost:8080/dashboard
2. Use the "Upload After Visit Summary" card at the top
3. Drag & drop or browse for your document (PDF, TXT, or DOCX)
4. Watch the dashboard auto-populate with extracted data!

## Test Document

A sample After Visit Summary is available at:
`backend/test_documents/sample_after_visit_summary.txt`

Upload this to see the feature in action!

## What Gets Extracted

- Patient Profile (name, DOB, age, sex, MRN, etc.)
- Vital Signs (BP, HR, temp, BMI, SpO2, etc.)
- ICD-10 Diagnosis Codes
- Allergies with severity
- Lab Test Results
- Current Medications
- Plan of Care

The AI automatically parses unstructured text and maps it to the dashboard format!
