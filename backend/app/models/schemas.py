from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class Source(BaseModel):
    document: str
    page: Optional[int] = None
    snippet: str
    relevance: float = Field(ge=0, le=1)


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    response: str
    sources: List[Source] = []
    confidence: float = Field(ge=0, le=1)
    agent_used: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    reasoning_steps: List[str] = []


class DocumentInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_type: str
    file_size: int
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    num_chunks: int = 0
    status: str = "processing"  # processing, ready, error


class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int


class StatsResponse(BaseModel):
    total_documents: int
    total_queries: int
    avg_confidence: float
    agent_usage: dict
    recent_activity: List[dict]


class HealthResponse(BaseModel):
    status: str
    version: str
    llm_provider: str
    documents_loaded: int
    vector_store_status: str
