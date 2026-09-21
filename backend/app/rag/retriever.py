from typing import List, Tuple
from langchain_core.documents import Document
from app.rag.vectorstore import get_vectorstore
from app.config import settings


def retrieve_relevant_documents(query: str, k: int = None) -> List[Tuple[Document, float]]:
    """Retrieve relevant documents with similarity scores."""
    if k is None:
        k = settings.TOP_K_RESULTS
    
    vectorstore = get_vectorstore()
    
    try:
        results = vectorstore.similarity_search_with_relevance_scores(
            query, k=k
        )
        return results
    except Exception as e:
        print(f"Retrieval error: {e}")
        return []


def format_context(documents: List[Tuple[Document, float]]) -> str:
    """Format retrieved documents into a context string."""
    if not documents:
        return "No relevant documents found."
    
    context_parts = []
    for i, (doc, score) in enumerate(documents, 1):
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "N/A")
        context_parts.append(
            f"[Source {i}] (File: {source}, Page: {page}, Relevance: {score:.2f})\n"
            f"{doc.page_content}\n"
        )
    
    return "\n---\n".join(context_parts)
