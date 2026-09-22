import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MedAssist AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    HF_TOKEN: str = ""
    
    # LLM Config
    LLM_PROVIDER: str = "huggingface"  # "ollama", "groq", "openai", "google", or "huggingface"
    LLM_MODEL: str = "Qwen/Qwen2.5-72B-Instruct"
    
    # Embedding Config
    EMBEDDING_PROVIDER: str = "google" # "ollama", "google", "openai"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    # Vector Store
    CHROMA_PERSIST_DIR: str = "./data/chromadb"
    COLLECTION_NAME: str = "medical_documents"
    
    # Document Processing
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "./data/uploads"
    
    # RAG Config
    TOP_K_RESULTS: int = 5
    CONFIDENCE_THRESHOLD: float = 0.7
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Ensure directories exist
Path(settings.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
