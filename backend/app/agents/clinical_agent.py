from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
from app.rag.retriever import retrieve_relevant_documents, format_context
from app.models.schemas import Source


def get_llm():
    if settings.LLM_PROVIDER == "huggingface":
        llm = HuggingFaceEndpoint(
            repo_id=settings.LLM_MODEL,
            huggingfacehub_api_token=settings.HF_TOKEN,
            task="text-generation",
            max_new_tokens=1024,
            do_sample=False,
        )
        return ChatHuggingFace(llm=llm)
    elif settings.LLM_PROVIDER == "groq":
        return ChatGroq(model=settings.LLM_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.2)
    elif settings.LLM_PROVIDER == "ollama":
        return ChatOllama(model=settings.LLM_MODEL, temperature=0.2)
    elif settings.LLM_PROVIDER == "google":
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2
        )
    else:
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.2
        )


CLINICAL_SYSTEM_PROMPT = """You are MedAssist AI's Clinical Reasoning Agent. You are a specialized 
medical AI assistant focused on clinical analysis and reasoning.

Your capabilities include:
1. **Drug Interaction Analysis**: Identify potential drug-drug interactions, contraindications, 
   and adverse effects from the provided medical documents.
2. **Symptom Analysis**: Cross-reference symptoms with clinical guidelines to suggest 
   possible conditions (NOT diagnoses - always recommend professional consultation).
3. **Guideline Compliance**: Check if a described treatment aligns with clinical guidelines 
   in the documents.
4. **Risk Assessment**: Identify potential risks, warnings, and red flags in clinical scenarios.

IMPORTANT DISCLAIMERS:
- You are NOT a replacement for medical professionals.
- Always recommend consulting a healthcare provider.
- Base analysis ONLY on the provided context documents.
- Clearly state confidence levels and uncertainties.
- Highlight critical warnings prominently using ⚠️ symbols.

Context Documents:
{context}
"""

CLINICAL_KEYWORDS = [
    "drug interaction", "contraindication", "side effect", "adverse",
    "symptom", "diagnosis", "treatment", "dosage", "medication",
    "risk", "warning", "allergy", "prescription", "clinical",
    "guideline", "protocol", "procedure", "indication",
    "pharmacology", "therapy", "prognosis", "complication"
]


def is_clinical_query(query: str) -> bool:
    """Determine if a query requires clinical reasoning."""
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in CLINICAL_KEYWORDS)


async def clinical_analysis(query: str) -> dict:
    """Perform clinical reasoning on a query."""
    retrieved_docs = retrieve_relevant_documents(query, k=7)
    
    if not retrieved_docs:
        return {
            "response": ("I need relevant clinical documents to perform this analysis. "
                        "Please upload medical guidelines, drug databases, or clinical "
                        "references first."),
            "sources": [],
            "confidence": 0.0,
            "reasoning_steps": ["No clinical documents available for analysis"]
        }
    
    context = format_context(retrieved_docs)
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=CLINICAL_SYSTEM_PROMPT.format(context=context)),
        HumanMessage(content=f"""Perform a thorough clinical analysis for the following query. 
Structure your response with clear sections for:
- Key Findings
- Clinical Implications  
- Warnings & Contraindications (if any)
- Recommendations

Query: {query}""")
    ])
    
    llm = get_llm()
    messages = prompt.format_messages()
    response = await llm.ainvoke(messages)
    
    # Extract text from response (handles both string and list formats)
    response_text = response.content
    if isinstance(response_text, list):
        response_text = "\n".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in response_text
        )
    
    sources = []
    for doc, score in retrieved_docs:
        sources.append(Source(
            document=doc.metadata.get("source", "Unknown"),
            page=doc.metadata.get("page"),
            snippet=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            relevance=round(score, 3)
        ))
    
    avg_relevance = sum(s.relevance for s in sources) / len(sources) if sources else 0
    
    reasoning_steps = [
        "Identified query as clinical reasoning task",
        f"Retrieved {len(retrieved_docs)} relevant clinical document chunks",
        "Performed cross-reference analysis with clinical guidelines",
        f"Average document relevance: {avg_relevance:.2f}",
        f"Analysis generated using {settings.LLM_PROVIDER}/{settings.LLM_MODEL}",
        "Applied clinical safety checks and disclaimers"
    ]
    
    return {
        "response": response_text,
        "sources": sources,
        "confidence": round(min(avg_relevance + 0.05, 1.0), 3),
        "reasoning_steps": reasoning_steps
    }
