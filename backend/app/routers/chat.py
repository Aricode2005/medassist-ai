from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.agents.orchestrator import process_query, get_chat_history

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get AI response."""
    try:
        response = await process_query(
            query=request.query,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.get("/history")
async def history(limit: int = 50):
    """Get chat history."""
    return get_chat_history(limit)
