import uuid
import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.document import DocumentMetadata
from app.utils.key_manager import GroqKeyManager

logger = logging.getLogger(__name__)

class GroqMetadataService:
    @staticmethod
    def extract_and_persist(db: Session, document_id: str, text: str, filename: str) -> dict:
        """
        Extracts document metadata using Groq (fallback routing supported) and saves to SQLite.
        Includes a caching layer: does not call Groq if metadata is already cached.
        Retries up to 2 times on general failures.
        """
        # 1. Caching Rule: If metadata exists, DO NOT call Groq again
        existing = db.query(DocumentMetadata).filter(DocumentMetadata.document_id == document_id).first()
        if existing:
            logger.info(f"Metadata already cached in SQLite for document {document_id}")
            return {
                "id": existing.id,
                "document_id": existing.document_id,
                "title": existing.title,
                "summary": existing.summary,
                "tags": [t.strip() for t in existing.tags.split(",") if t.strip()] if existing.tags else [],
                "people": [p.strip() for p in existing.people.split(",") if p.strip()] if existing.people else [],
                "organizations": [o.strip() for o in existing.organizations.split(",") if o.strip()] if existing.organizations else [],
                "locations": [l.strip() for l in existing.locations.split(",") if l.strip()] if existing.locations else [],
                "emotions": [e.strip() for e in existing.emotions.split(",") if e.strip()] if existing.emotions else [],
                "cached": True
            }

        # 2. Input limit: First 2,000 characters of extracted text only
        truncated_text = text[:2000] if text else ""
        if not truncated_text:
            truncated_text = f"Empty file named {filename}"

        # 3. Setup Groq prompt requesting structured JSON output
        prompt = f"""
        Analyze the following document content and extract structured metadata.
        You MUST extract:
        - title (string): A short, descriptive title.
        - summary (string): A brief, 1-2 sentence summary.
        - tags (list of strings): Up to 5 relevant tags/topics.
        - people (list of strings): People mentioned.
        - organizations (list of strings): Companies or institutions.
        - locations (list of strings): Places, cities, or countries.
        - emotions (list of strings): Tone or emotional sentiment.

        Document Content:
        {truncated_text}

        Response must be strict JSON matching this structure:
        {{
          "title": "Title",
          "summary": "Summary text",
          "tags": ["tag1", "tag2"],
          "people": ["Person Name"],
          "organizations": ["Org Name"],
          "locations": ["Location Name"],
          "emotions": ["Emotional Tone"]
        }}
        """

        # 4. Helper executing Groq client call
        def call_groq(client):
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a precise metadata extraction assistant. Output valid JSON matching the schema only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            return json.loads(response.choices[0].message.content)

        # 5. Execute with fallback + maximum 2 retries (up to 3 total attempts)
        key_manager = GroqKeyManager()
        metadata_json = None
        max_attempts = 3
        
        for attempt in range(max_attempts):
            try:
                # KeyManager handles key rotation and exponential backoff on retry internally
                metadata_json = key_manager.execute_with_fallback(call_groq)
                break
            except Exception as e:
                logger.warning(f"Groq metadata generation attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_attempts - 1:
                    logger.error(f"All Groq metadata generation attempts failed for document {document_id}. Using fallback values.")

        # 6. Parse JSON and Fallback logic
        if not metadata_json:
            # Fallback metadata if Groq completely fails
            metadata_json = {
                "title": filename,
                "summary": "Document uploaded successfully. Content analysis is pending.",
                "tags": ["uploaded"],
                "people": [],
                "organizations": [],
                "locations": [],
                "emotions": ["neutral"]
            }

        # 7. Persist to database (join lists into comma-separated strings)
        db_meta = DocumentMetadata(
            id=str(uuid.uuid4()),
            document_id=document_id,
            title=metadata_json.get("title", filename),
            summary=metadata_json.get("summary", ""),
            tags=",".join(metadata_json.get("tags", [])),
            people=",".join(metadata_json.get("people", [])),
            organizations=",".join(metadata_json.get("organizations", [])),
            locations=",".join(metadata_json.get("locations", [])),
            emotions=",".join(metadata_json.get("emotions", [])),
            generated_at=datetime.utcnow()
        )
        
        try:
            db.add(db_meta)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to persist document metadata for {document_id}: {str(e)}")

        return {
            "id": db_meta.id,
            "document_id": document_id,
            "title": db_meta.title,
            "summary": db_meta.summary,
            "tags": metadata_json.get("tags", []),
            "people": metadata_json.get("people", []),
            "organizations": metadata_json.get("organizations", []),
            "locations": metadata_json.get("locations", []),
            "emotions": metadata_json.get("emotions", []),
            "cached": False
        }
