from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.connection import get_db
from app.rag.rag_engine import RAGEngine

router = APIRouter(prefix="/api/chat", tags=["chat"])
rag_engine = RAGEngine()

class QueryRequest(BaseModel):
    question: str

@router.post("/query")
def query_second_brain(request: QueryRequest):
    """
    POST route allowing users to ask questions, returning similarity matching,
    summarizations, citations, and confidence metrics.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        response = rag_engine.query(request.question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
def query_second_brain_stream(request: QueryRequest):
    """
    POST route to stream RAG response from Groq using Server-Sent Events (SSE).
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        return StreamingResponse(
            rag_engine.query_stream(request.question),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
