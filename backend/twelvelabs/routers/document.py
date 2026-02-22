from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging
from services.document_parser import parse_after_visit_summary
from typing import Dict, Any

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for parsed documents (keyed by session or user ID)
_document_cache: Dict[str, Any] = {}


@router.post("/document/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload an After Visit Summary document (PDF, TXT, or DOCX).
    Extracts patient vitals and medical information.
    """
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Please upload PDF, TXT, or DOCX files. Got: {file.content_type}"
            )

        # Read file content
        content = await file.read()
        
        # Parse the document
        logger.info(f"Processing document: {file.filename}, type: {file.content_type}")
        parsed_data = await parse_after_visit_summary(content, file.filename, file.content_type)
        
        # Store in cache (using a simple key for now - in production, use user/session ID)
        cache_key = "latest"
        _document_cache[cache_key] = parsed_data
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Document processed successfully",
                "data": parsed_data
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing document: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )


@router.get("/document/latest")
async def get_latest_document():
    """
    Retrieve the most recently uploaded and parsed document data.
    """
    cache_key = "latest"
    if cache_key not in _document_cache:
        raise HTTPException(
            status_code=404,
            detail="No document has been uploaded yet"
        )
    
    return JSONResponse(content=_document_cache[cache_key])
