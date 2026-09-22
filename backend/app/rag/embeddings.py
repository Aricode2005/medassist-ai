from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from app.config import settings


def get_embeddings():
    """Get the embedding model based on configuration."""
    if settings.EMBEDDING_PROVIDER == "ollama":
        return OllamaEmbeddings(
            model=settings.EMBEDDING_MODEL
        )
    elif settings.EMBEDDING_PROVIDER == "google":
        return GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
        )
    else:
        return OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=settings.OPENAI_API_KEY
        )
