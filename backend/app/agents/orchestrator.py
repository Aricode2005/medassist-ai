import uuid
from datetime import datetime
from app.agents.rag_agent import query_with_rag
from app.agents.clinical_agent import clinical_analysis, is_clinical_query
from app.models.schemas import ChatResponse

# In-memory storage for chat history and analytics
chat_history: list[ChatResponse] = []
query_stats: dict = {
    "total_queries": 0,
    "agent_usage": {"rag_agent": 0, "clinical_agent": 0},
    "total_confidence": 0.0
}


async def process_query(query: str, conversation_id: str = None) -> ChatResponse:
    """Main orchestrator: routes queries to the appropriate agent."""
    query_stats["total_queries"] += 1
    
    # Route to appropriate agent
    if is_clinical_query(query):
        agent_name = "clinical_agent"
        result = await clinical_analysis(query)
    else:
        agent_name = "rag_agent"
        result = await query_with_rag(query)
    
    query_stats["agent_usage"][agent_name] += 1
    query_stats["total_confidence"] += result["confidence"]
    
    # Build response
    response = ChatResponse(
        id=str(uuid.uuid4()),
        query=query,
        response=result["response"],
        sources=result["sources"],
        confidence=result["confidence"],
        agent_used=agent_name,
        timestamp=datetime.utcnow(),
        reasoning_steps=result["reasoning_steps"]
    )
    
    chat_history.append(response)
    
    return response


def get_chat_history(limit: int = 50) -> list[ChatResponse]:
    """Get recent chat history."""
    return chat_history[-limit:]


def get_stats() -> dict:
    """Get query statistics."""
    avg_confidence = (
        query_stats["total_confidence"] / query_stats["total_queries"]
        if query_stats["total_queries"] > 0 else 0.0
    )
    return {
        "total_queries": query_stats["total_queries"],
        "agent_usage": query_stats["agent_usage"],
        "avg_confidence": round(avg_confidence, 3)
    }
