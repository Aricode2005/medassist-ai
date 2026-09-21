import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.agents.ingestion_agent import (
    process_document, get_all_documents, delete_document
)
from app.models.schemas import DocumentInfo, DocumentListResponse

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".csv", ".md"}


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document."""
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)
    
    try:
        doc_info = process_document(file_path, file.filename)
        return doc_info
    except Exception as e:
        # Cleanup on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents."""
    docs = get_all_documents()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.delete("/{doc_id}")
async def remove_document(doc_id: str):
    """Delete a document."""
    if delete_document(doc_id):
        return {"message": "Document deleted successfully"}
    raise HTTPException(status_code=404, detail="Document not found")
