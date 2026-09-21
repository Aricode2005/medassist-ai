from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
from app.rag.retriever import retrieve_relevant_documents, format_context
from app.models.schemas import Source


def get_llm():
    """Get LLM based on configuration."""
    if settings.LLM_PROVIDER == "google":
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.3
        )
    else:
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )


RAG_SYSTEM_PROMPT = """You are MedAssist AI, an intelligent clinical document assistant. 
You help healthcare professionals find accurate information from medical documents, 
clinical guidelines, and health records.

IMPORTANT RULES:
1. Base your answers ONLY on the provided context documents.
2. If the context doesn't contain enough information, clearly state that.
3. Always cite your sources with [Source N] references.
4. Be precise and use medical terminology appropriately.
5. Highlight any important warnings, contraindications, or critical information.
6. Structure your responses clearly with headings and bullet points when appropriate.

Context Documents:
{context}
"""


async def query_with_rag(query: str) -> dict:
    """Process a query using RAG pipeline."""
    # Retrieve relevant documents
    retrieved_docs = retrieve_relevant_documents(query)
    
    if not retrieved_docs:
        return {
            "response": "I couldn't find any relevant information in the uploaded documents. Please upload relevant medical documents first, or try rephrasing your question.",
            "sources": [],
            "confidence": 0.0,
            "reasoning_steps": ["No relevant documents found in vector store"]
        }
    
    # Format context
    context = format_context(retrieved_docs)
    
    # Build prompt
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=RAG_SYSTEM_PROMPT.format(context=context)),
        HumanMessage(content=query)
    ])
    
    # Get LLM response
    llm = get_llm()
    messages = prompt.format_messages()
    response = await llm.ainvoke(messages)
    
    # Build sources list
    sources = []
    for doc, score in retrieved_docs:
        sources.append(Source(
            document=doc.metadata.get("source", "Unknown"),
            page=doc.metadata.get("page"),
            snippet=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            relevance=round(score, 3)
        ))
    
    # Calculate confidence
    avg_relevance = sum(s.relevance for s in sources) / len(sources) if sources else 0
    
    reasoning_steps = [
        f"Retrieved {len(retrieved_docs)} relevant document chunks",
        f"Average relevance score: {avg_relevance:.2f}",
        f"Generated response using {settings.LLM_PROVIDER}/{settings.LLM_MODEL}",
        f"Cited {len(sources)} sources"
    ]
    
    return {
        "response": response.content,
        "sources": sources,
        "confidence": round(min(avg_relevance + 0.1, 1.0), 3),
        "reasoning_steps": reasoning_steps
    }
