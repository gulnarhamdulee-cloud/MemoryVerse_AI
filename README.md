# MemoryVerse AI

MemoryVerse AI is an AI-powered personal memory assistant that remembers, organizes, and connects a person's entire digital journey. It serves as a digital "second brain," allowing users to upload documents, images, notes, and PDFs, automatically extract metadata/entities, discover semantic relationships, and query their memories using natural language.

## Tech Stack

### Frontend
- **Framework:** React with Vite (Fast, hot module reloading)
- **Routing:** React Router DOM
- **State Management:** Zustand (Lightweight, hook-based state management)
- **Data Fetching:** TanStack React Query (Cache management, query states)
- **Styling:** Tailwind CSS & Framer Motion (Smooth premium animations)
- **Icons & Visuals:** Lucide React & Recharts (Data visualization)
- **Form Handling:** React Hook Form
- **API Client:** Axios

### Backend & AI
- **Framework:** FastAPI with Uvicorn (Asynchronous Python API server)
- **Database / ORM:** SQLite & SQLAlchemy
- **Vector DB:** ChromaDB (Local vector database for semantic search)
- **Embeddings:** Sentence Transformers (`all-MiniLM-L6-v2`)
- **LLM Engine:** Groq SDK (Llama 3 / Mixtral models)
- **Framework Orchestration:** LangChain
- **Storage:** Supabase Storage SDK (For file storage)
- **Configuration:** Python-dotenv

---

## Directory Structure

```text
memoryverse-ai/
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets (images, icons)
│   │   ├── components/      # UI, Layout, Timeline, Upload, Chat, Graph components
│   │   ├── pages/           # High-level route pages (Dashboard, Upload, Memories, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context providers (e.g. Theme)
│   │   ├── services/        # API service clients
│   │   ├── utils/           # Helper utility functions
│   │   ├── styles/          # Styling files (index.css)
│   │   └── App.jsx          # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/             # API Endpoints (auth, uploads, memories, chat, graph)
│   │   ├── services/        # Core business logic / third party integrations
│   │   ├── models/          # SQLAlchemy database models
│   │   ├── schemas/         # Pydantic schemas for request/response validation
│   │   ├── database/        # SQLite connection, session makers
│   │   ├── utils/           # Utilities and helpers
│   │   ├── rag/             # Retrieval Augmented Generation logic
│   │   ├── embeddings/      # Document parsing & embedding generation
│   │   ├── graph/           # Knowledge graph / relationship engine
│   │   └── main.py          # FastAPI application entry point
│   ├── requirements.txt
│   └── render.yaml
│
├── docs/
│   ├── architecture.png     # Architecture diagram
│   ├── workflow.png         # Workflow diagram
│   └── thought-process.md   # Architectural decisions & implementation logic
│
├── README.md
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Installation

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
5. Run the backend development server:
   ```bash
   uvicorn app.main:app --reload
   ```
