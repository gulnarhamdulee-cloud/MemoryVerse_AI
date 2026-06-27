from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.api.upload import router as upload_router
from app.api.graph import router as graph_router
from app.api.timeline import router as timeline_router
from app.api.chat import router as chat_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.search import router as search_router
from app.database.connection import Base, engine, get_db
from app.models.document import DocumentModel, Document, DocumentContent, DocumentChunk, DocumentMetadata, DocumentEmbeddingStatus, RAGCache
from app.models.graph import GraphNodeModel, GraphEdgeModel
from app.models.user import UserModel

# Create database tables
Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(
    title="MemoryVerse AI API",
    description="Backend API for MemoryVerse AI - Your Personal Digital Second Brain",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)
app.include_router(graph_router)
app.include_router(timeline_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(search_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the MemoryVerse AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/system/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """Wipes all documents, graph nodes, and graph edges from SQLite database."""
    # Wipe graph elements
    db.query(GraphEdgeModel).delete()
    db.query(GraphNodeModel).delete()
    
    # Wipe document files on disk and database records
    docs = db.query(Document).all()
    for doc in docs:
        if os.path.exists(doc.filepath):
            try:
                os.remove(doc.filepath)
            except Exception:
                pass
        db.delete(doc)
        
    db.commit()
    return {"message": "Local database and uploads reset successfully"}

