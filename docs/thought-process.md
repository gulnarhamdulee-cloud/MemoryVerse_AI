# Thought Process & Architectural Decisions

## Overview
MemoryVerse AI aims to build a digital "second brain" that acts as a secure, fast, and comprehensive search & relational graph engine for personal knowledge.

## Backend Architecture
- **FastAPI:** Chosen for its outstanding performance (built on Starlette & Uvicorn), native support for asynchronous tasks, automatic OpenAPI documentation, and typed validation with Pydantic.
- **SQLAlchemy with SQLite:** Offers an lightweight, relational SQL engine for structured metadata, chat sessions, user settings, and relationships/graph tables.
- **ChromaDB:** A lightweight, embeddable vector database running locally. We avoid heavy cloud database overhead while getting robust similarity search.
- **all-MiniLM-L6-v2:** A very efficient, compact embedding model with 384 dimensions, striking an excellent balance between accuracy, embedding speed, and resource footprint.

## RAG Workflow
1. **Document Upload:** Handled via custom parsing service supporting PDF, DOCX, TXT, and Images (OCR).
2. **Chunking & Embedding:** Documents are chunked into smaller passages (respecting token limitations) and embedded using the Sentence Transformers model.
3. **Storage:** Raw files go to Supabase storage, metadata gets stored in SQLite, and vector embeddings are stored in ChromaDB.
4. **Relationship Mapping:** Entities (people, locations, organizations) are extracted from uploaded files and mapped onto an adjacency-list-based relational graph database in SQLite.
5. **Conversational Search:** Natural language questions retrieve top 3 chunks from ChromaDB, format them as context, and query Groq LLM under strict daily/minute rate limits.

## Frontend Design Strategy
- **Premium Apple-like Minimalist Aesthetic:** Avoiding overused cyberpunk colors, dark/neon gradients. Using a clean neutral palette (grays, whites, rich charcoal) with subtle indigo and violet accents.
- **Zustand:** Extremely light state management allowing clean hooks for global state (themes, user settings, active chat session).
- **TanStack React Query:** Managing server-side cache invalidation, loading spinners, error states, and pagination seamlessly.
