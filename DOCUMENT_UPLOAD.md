# Document Upload Setup Guide

## Overview
The Dashboard now supports uploading After Visit Summary documents (PDF, TXT, or DOCX). The system uses AI to extract patient vitals, diagnoses, medications, and other clinical data from the document and automatically populates the dashboard.

## Setup Instructions

### 1. Backend Setup

#### Install Required Dependencies
```bash
cd backend/twelvelabs
pip install -r requirements.txt
```

This will install the new dependencies:
- `PyPDF2` - PDF text extraction
- `python-docx` - DOCX text extraction  
- `google-generativeai` - Google Gemini AI for document parsing (FREE tier available)

#### Configure Gemini API Key
Add your Gemini API key to `backend/twelvelabs/.env` (or `backend/.env`):
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key at: https://makersuite.google.com/app/apikey

The document parser uses Google's Gemini 1.5 Flash model to extract structured medical data from unstructured documents. The free tier is generous and should be sufficient for most use cases.

#### Restart the Backend
```bash
cd backend/twelvelabs
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

No additional setup required - the frontend already has the necessary dependencies.

### 3. Test the Feature

1. Start both frontend and backend servers
2. Navigate to the Dashboard page (http://localhost:8080/dashboard)
3. You'll see a new "Upload After Visit Summary" card at the top
4. Upload a test document (see `backend/test_documents/` for examples)
5. The dashboard will automatically update with the extracted data

## API Endpoints

### Upload Document
```
POST /api/document/upload
Content-Type: multipart/form-data

Body:
- file: File (PDF, TXT, or DOCX)

Returns: DashboardData object with all extracted fields
```

### Get Latest Document
```
GET /api/document/latest

Returns: DashboardData object from the most recently uploaded document
```

## Data Structure

The parser extracts the following information:

```typescript
{
  patientProfile: {
    name, dob, age, sex, mrn, primaryPhysician, 
    insuranceProvider, lastVisit
  },
  vitalSigns: [
    {label, value, unit, status, icon}
  ],
  icd10Codes: [
    {code, description, status}
  ],
  allergies: [
    {name, severity, reaction}
  ],
  labTests: [
    {name, status, date, result, normalRange}
  ],
  medications: [
    {name, dosage, frequency, status}
  ],
  planOfCare: [string]
}
```

## Fallback Behavior

If Gemini API key is not configured, the system falls back to regex-based parsing (less accurate). It's recommended to configure the Gemini API key for best results.

Get a free Gemini API key at: https://makersuite.google.com/app/apikey

## File Size Limits

- Maximum file size: 10MB
- Supported formats: PDF, TXT, DOCX
- Text extraction is performed server-side

## Troubleshooting

### "Document upload failed"
- Check that the file format is supported (PDF, TXT, or DOCX)
- Verify file size is under 10MB
- Check backend logs for detailed error messages

### "Gemini API key not configured"
- Add `GEMINI_API_KEY` to your `.env` file
- Get a free key at https://makersuite.google.com/app/apikey
- Restart the backend server

### "Failed to extract text"
- Ensure the PDF is not password-protected or image-only
- Try converting the document to TXT format
- Check backend logs for specific extraction errors
