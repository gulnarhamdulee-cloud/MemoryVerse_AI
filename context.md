# MemoryVerse AI - Project Context

## Project Name

MemoryVerse AI

## Project Vision

MemoryVerse AI is an AI-powered personal memory assistant that remembers, organizes, and connects a person's entire digital journey.

The application should ingest files such as documents, notes, PDFs, images, and text data, intelligently organize them, discover relationships between information, and allow users to retrieve memories using natural language queries.

The application should feel like a second brain and personal knowledge system.

---

# Hackathon Problem Statement

Build an AI that remembers, organizes, and connects a person's entire digital journey.

The solution should demonstrate:

* NLP
* Embeddings
* Semantic Search
* Vector Databases
* Retrieval Augmented Generation (RAG)
* Knowledge Mapping
* Information Organization
* Excellent User Experience

---

# Hackathon Evaluation Criteria

## Criteria 1 (40%)

Quality of AI organization, categorization, and information retrieval.

## Criteria 2 (25%)

Use of AI and ML techniques:

* Embeddings
* NLP
* Semantic Search
* Knowledge Mapping

## Criteria 3 (20%)

Innovation, usefulness, and user experience.

## Criteria 4 (15%)

Clarity of explanation, architecture, and thought process.

---

# Tech Stack

## Frontend

* React
* Vite
* React Router
* TailwindCSS
* Framer Motion
* Zustand
* TanStack React Query
* Axios
* React Hook Form
* Lucide React
* Recharts
* React Hot Toast

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* SQLAlchemy
* ChromaDB
* Sentence Transformers
* LangChain
* Groq SDK
* Supabase Python SDK
* Python Dotenv
* PyPDF
* Python Docx
* Unstructured
* Tiktoken

## Storage

* Supabase Storage

## Embeddings

Model:
all-MiniLM-L6-v2

## Vector Database

ChromaDB

## LLM Provider

Groq

## Deployment

Frontend:
Vercel

Backend:
Render

Total Cost Target:
₹0

---

# Core Features

## Module 1

File Upload and Ingestion

Supported Formats:

* PDF
* DOCX
* TXT
* Images

---

## Module 2

AI Metadata Extraction

Generate:

* Title
* Summary
* Tags
* Topics
* People
* Organizations
* Locations
* Emotions

---

## Module 3

Embeddings and Semantic Search

Flow:

Document
→ Chunking
→ Embeddings
→ ChromaDB
→ Similarity Search

---

## Module 4

Relationship Engine

Detect relationships between:

* People
* Events
* Documents
* Topics
* Locations
* Organizations

Store graph structure consisting of:

* Nodes
* Edges
* Weights

---

## Module 5

Timeline Engine

Generate:

* Timeline View
* Calendar View
* Activity Feed
* Filters

---

## Module 6

Conversational Memory Assistant

Capabilities:

* Ask natural language questions
* Retrieve memories
* Provide citations
* Suggest follow-up questions
* Maintain conversation history

---

# RAG Architecture

Question
→ Query Embedding
→ Similarity Search
→ Retrieve Top 3 Chunks
→ Context Builder
→ Groq
→ Final Answer

---

# Groq Constraints

Free Tier Limits:

* 14,400 requests per day
* 6,000 tokens per minute

Mandatory Optimizations:

1. Cache extracted metadata after first upload.
2. Never regenerate metadata if cached.
3. Limit document text sent to Groq to a maximum of 2,000 characters.
4. Batch metadata extraction into a single prompt.
5. Implement retry handling for rate limits.
6. Store metadata in persistent storage.
7. Limit RAG context to Top 3 relevant chunks only.

---

# User Experience Requirements

The application should NOT feel like generic AI software.

Avoid:

* Neon cyberpunk themes
* Overuse of gradients
* Excessive glassmorphism
* Busy dashboards
* Artificial AI aesthetics

Preferred Inspiration:

* Linear
* Notion
* Apple

Design Principles:

* Minimal
* Premium
* Clean
* Subtle
* Accessible
* Responsive
* Consistent spacing
* Plenty of whitespace

Theme Requirements:

* Light Mode
* Dark Mode
* Theme persistence
* Smooth transitions

Color Direction:

* Neutral grays
* Indigo accents
* Violet accents

Typography:

* Inter font
* Clear hierarchy
* Accessible contrast

---

# Desired Folder Structure

memoryverse-ai
├── frontend
├── backend
├── docs
├── context.md
├── README.md
└── .gitignore

---

# Required Deliverables

1. Working Prototype
2. Live Deployment
3. GitHub Repository
4. README
5. Architecture Diagram
6. AI Workflow Diagram
7. Thought Process Sheet
8. Demo Video
9. Submission Checklist

---

# Development Rule (IMPORTANT)

This file is ONLY a project reference document.

DO NOT generate the entire project in one response.

DO NOT implement future phases automatically.

DO NOT create all features at once.

Work strictly phase by phase.

After completing a phase:

1. Stop.
2. Explain what was created.
3. Wait for user approval.
4. Proceed only when explicitly instructed.

The development process must be incremental, modular, and review-driven.

Never skip phases.

Never assume future implementation decisions.

Always ask for confirmation before moving to the next phase.
