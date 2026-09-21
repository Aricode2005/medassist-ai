from fastapi import APIRouter
from app.agents.orchestrator import get_stats, get_chat_history
from app.agents.ingestion_agent import get_all_documents
from app.rag.vectorstore import get_document_count
from app.models.schemas import StatsResponse

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/stats", response_model=StatsResponse)
async def get_analytics():
    """Get usage analytics and statistics."""
    stats = get_stats()
    documents = get_all_documents()
    history = get_chat_history(20)
    
    recent_activity = []
    for chat in history[-10:]:
        recent_activity.append({
            "id": chat.id,
            "query": chat.query[:100],
            "agent": chat.agent_used,
            "confidence": chat.confidence,
            "timestamp": chat.timestamp.isoformat()
        })
    
    return StatsResponse(
        total_documents=len(documents),
        total_queries=stats["total_queries"],
        avg_confidence=stats["avg_confidence"],
        agent_usage=stats["agent_usage"],
        recent_activity=recent_activity
    )
