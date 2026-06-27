import os
import uuid
import logging
from datetime import datetime
from app.database.connection import SessionLocal
from app.models.document import DocumentContent
from app.services.extractor import ExtractorService
from app.services.chunk_service import ChunkService
from app.services.groq_metadata_service import GroqMetadataService
from app.services.relationship import RelationshipService

logger = logging.getLogger(__name__)

class ExtractionService:
    @staticmethod
    def run_extraction_task(file_path: str, content_type: str, document_id: str):
        """
        Background task to extract text from an uploaded file and persist it.
        """
        db = SessionLocal()
        try:
            # Extract raw text using ExtractorService
            raw_text = ExtractorService.extract_text(file_path, content_type)
            text_length = len(raw_text) if raw_text else 0
            
            # Persist to database
            content_record = DocumentContent(
                id=str(uuid.uuid4()),
                document_id=document_id,
                raw_text=raw_text,
                text_length=text_length,
                extracted_at=datetime.utcnow()
            )
            
            db.add(content_record)
            db.commit()

            # Trigger text segment chunking and persistence
            if raw_text:
                ChunkService.chunk_and_persist(db, document_id, raw_text)
                try:
                    from app.services.embedding_service import EmbeddingService
                    EmbeddingService.generate_and_index_document(db, document_id)
                except Exception as embedding_error:
                    logger.error(f"Embedding generation failed for document {document_id}: {str(embedding_error)}", exc_info=True)
            
            # Trigger metadata generation using Groq LLM
            filename = os.path.basename(file_path).split('_', 1)[-1]  # Strip unique prefix
            try:
                meta_res = GroqMetadataService.extract_and_persist(db, document_id, raw_text, filename)
                
                # Trigger Relationship Engine V1 processing
                RelationshipService.process_document_relationships(
                    db=db,
                    document_id=document_id,
                    title=meta_res.get("title", filename),
                    metadata=meta_res
                )
            except Exception as metadata_error:
                # Store metadata errors in logs (failures should not break upload/ingestion)
                logger.error(f"Metadata and relationship generation failed for document {document_id}: {str(metadata_error)}", exc_info=True)
            
            return {
                "document_id": document_id,
                "text_length": text_length,
                "extraction_status": "success"
            }
        except Exception as e:
            # Store extraction errors in logs (Rule: Failures should not break upload)
            logger.error(f"Text extraction failed for document {document_id}: {str(e)}", exc_info=True)
            db.rollback()
            return {
                "document_id": document_id,
                "text_length": 0,
                "extraction_status": "failed"
            }
        finally:
            db.close()
