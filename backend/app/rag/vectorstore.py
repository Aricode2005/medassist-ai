import chromadb
from langchain_chroma import Chroma
from app.config import settings
from app.rag.embeddings import get_embeddings

# Global vector store instance
_vectorstore = None


def get_vectorstore() -> Chroma:
    """Get or create the ChromaDB vector store."""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = Chroma(
            collection_name=settings.COLLECTION_NAME,
            embedding_function=get_embeddings(),
            persist_directory=settings.CHROMA_PERSIST_DIR
        )
    return _vectorstore


def get_document_count() -> int:
    """Get total number of documents in the vector store."""
    try:
        vs = get_vectorstore()
        return vs._collection.count()
    except Exception:
        return 0


def reset_vectorstore():
    """Reset the vector store (for testing)."""
    global _vectorstore
    _vectorstore = None
