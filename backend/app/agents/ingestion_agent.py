import os
import uuid
from typing import List
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    CSVLoader,
)
from app.config import settings
from app.rag.vectorstore import get_vectorstore
from app.models.schemas import DocumentInfo

# In-memory document registry
document_registry: dict[str, DocumentInfo] = {}


def get_loader(file_path: str):
    """Get appropriate document loader based on file extension."""
    ext = Path(file_path).suffix.lower()
    loaders = {
        ".pdf": PyPDFLoader,
        ".txt": TextLoader,
        ".csv": CSVLoader,
        ".md": TextLoader,
    }
    loader_class = loaders.get(ext)
    if loader_class is None:
        raise ValueError(f"Unsupported file type: {ext}")
    return loader_class(file_path)


def process_document(file_path: str, filename: str) -> DocumentInfo:
    """Process and ingest a document into the vector store."""
    doc_id = str(uuid.uuid4())
    file_size = os.path.getsize(file_path)
    file_type = Path(file_path).suffix.lower().replace(".", "")
    
    doc_info = DocumentInfo(
        id=doc_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        status="processing"
    )
    document_registry[doc_id] = doc_info
    
    try:
        # Load document
        loader = get_loader(file_path)
        documents = loader.load()
        
        # Add metadata
        for doc in documents:
            doc.metadata["source"] = filename
            doc.metadata["doc_id"] = doc_id
        
        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        
        # Add to vector store
        vectorstore = get_vectorstore()
        vectorstore.add_documents(chunks)
        
        # Update registry
        doc_info.num_chunks = len(chunks)
        doc_info.status = "ready"
        document_registry[doc_id] = doc_info
        
        return doc_info
    
    except Exception as e:
        doc_info.status = "error"
        document_registry[doc_id] = doc_info
        raise e


def get_all_documents() -> List[DocumentInfo]:
    """Get all registered documents."""
    return list(document_registry.values())


def delete_document(doc_id: str) -> bool:
    """Delete a document from the registry."""
    if doc_id in document_registry:
        del document_registry[doc_id]
        return True
    return False
