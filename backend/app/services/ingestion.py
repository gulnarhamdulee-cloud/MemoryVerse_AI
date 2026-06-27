import uuid
from typing import Dict, Any
from app.services.extractor import ExtractorService
from app.services.chunker import ChunkerService
from app.services.metadata import MetadataExtractorService
from app.services.embedding import EmbeddingService
from app.services.vectorstore import VectorStoreService

class IngestionService:
    def __init__(self):
        self.chunker = ChunkerService()
        self.metadata_extractor = MetadataExtractorService()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()

    def ingest_file(self, file_path: str, filename: str, content_type: str, db) -> Dict[str, Any]:
        """
        Coordinates the full ingestion pipeline:
        1. Cache Check (Avoid regenerating metadata if already completed)
        2. Text Extraction (PDF/DOCX/TXT/OCR)
        3. Text Chunking
        4. Metadata Generation (via Groq/fallback)
        5. Embeddings Generation (via all-MiniLM-L6-v2)
        6. Storage in Vector DB (ChromaDB)
        7. Cache Storage (Save metadata in SQL database)
        """
        import os
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

        # Optimization Rule 2: Never regenerate metadata if cached
        cached_metadata = self.metadata_extractor.check_cache(db, filename, file_size)
        if cached_metadata:
            # Reconstruct document_id from database if we want to trace it, or create a new ingestion trace
            # Retrieve the cached document model to get the existing document_id
            from app.models.document import DocumentModel
            cached_doc = db.query(DocumentModel).filter(
                DocumentModel.filename == filename,
                DocumentModel.size == file_size,
                DocumentModel.status == "completed"
            ).first()
            
            # Re-verify chunks can be extracted for vector db check
            extracted_text = ExtractorService.extract_text(file_path, content_type)
            chunks = self.chunker.chunk_text(extracted_text)
            
            return {
                "document_id": cached_doc.id,
                "chunks_count": len(chunks),
                "chunks": chunks[:5],
                "metadata": cached_metadata,
                "embeddings_count": len(chunks),
                "cached": True
            }

        # Step 2: Text extraction
        extracted_text = ExtractorService.extract_text(file_path, content_type)
        if not extracted_text:
            raise ValueError("No text could be extracted from the file.")

        # Step 3: Chunking
        chunks = self.chunker.chunk_text(extracted_text)
        if not chunks:
            raise ValueError("Document text could not be split into chunks.")

        # Step 4: Metadata extraction (Optimization Rule 4: Batch in one prompt; Rule 3: max 2,000 characters)
        metadata = self.metadata_extractor.extract_metadata(extracted_text, filename)

        # Step 5: Embedding generation (all-MiniLM-L6-v2)
        embeddings = self.embedding_service.generate_embeddings(chunks)

        # Step 6: Vector storage (ChromaDB)
        document_id = str(uuid.uuid4())
        self.vector_store.add_documents(
            document_id=document_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata=metadata
        )

        # Optimization Rule 1 & 6: Store and cache metadata in database
        self.metadata_extractor.save_to_cache(
            db=db,
            document_id=document_id,
            filename=filename,
            file_path=file_path,
            content_type=content_type,
            size=file_size,
            metadata=metadata
        )

        # Trigger relationship graph analysis
        from app.services.relationship import RelationshipService
        try:
            RelationshipService.process_document_relationships(
                db=db,
                document_id=document_id,
                title=metadata.get("title", filename),
                metadata=metadata
            )
        except Exception as e:
            # Prevent relationship extraction failures from crashing the entire file ingestion
            pass

        return {
            "document_id": document_id,
            "chunks_count": len(chunks),
            "chunks": chunks[:5],
            "metadata": metadata,
            "embeddings_count": len(embeddings),
            "cached": False
        }
