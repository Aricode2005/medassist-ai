from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import chat, documents, analytics
from app.rag.vectorstore import get_document_count
import os

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered clinical document assistant with multi-agent RAG pipeline",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.head("/")
async def root():
    return {"message": "MedAssist API is running. Please use the frontend UI to interact with the application."}


# Mount routers
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(analytics.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    try:
        doc_count = get_document_count()
        vs_status = "connected"
    except Exception:
        doc_count = 0
        vs_status = "disconnected"
    
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "documents_loaded": doc_count,
        "vector_store_status": vs_status
    }


# Serve static frontend files in production
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
