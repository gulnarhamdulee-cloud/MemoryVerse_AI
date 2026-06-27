import os
from typing import List, Dict, Any
import chromadb
from app.services.vectorstore_interface import VectorStoreInterface

class VectorStoreService(VectorStoreInterface):
    def __init__(self, db_path: str = "./chroma_db"):
        self.db_path = os.path.abspath(db_path)
        os.makedirs(self.db_path, exist_ok=True)
        
        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Get or create the core collection
        self.collection = self.client.get_or_create_collection(
            name="memory_verse_vectors",
            metadata={"hnsw:space": "cosine"}
        )

    def add_documents(
        self, 
        document_id: str, 
        chunks: List[str], 
        embeddings: List[List[float]], 
        metadata: Dict[str, Any]
    ) -> None:
        """
        Stores document text chunks, embeddings, and associated metadata in ChromaDB.
        Implements VectorStoreInterface.
        """
        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        
        # Generate metadata dict for each individual chunk to record document_id and chunk_id
        metadatas = []
        for i in range(len(chunks)):
            flat_metadata = {
                "document_id": document_id,
                "chunk_id": ids[i],
                "title": metadata.get("title", ""),
                "tags": ",".join(metadata.get("tags", [])) if isinstance(metadata.get("tags"), list) else str(metadata.get("tags", "")),
                "topics": ",".join(metadata.get("topics", [])) if isinstance(metadata.get("topics"), list) else str(metadata.get("topics", "")),
                "people": ",".join(metadata.get("people", [])) if isinstance(metadata.get("people"), list) else str(metadata.get("people", "")),
                "organizations": ",".join(metadata.get("organizations", [])) if isinstance(metadata.get("organizations"), list) else str(metadata.get("organizations", "")),
                "locations": ",".join(metadata.get("locations", [])) if isinstance(metadata.get("locations"), list) else str(metadata.get("locations", ""))
            }
            metadatas.append(flat_metadata)

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

    def search_similar(self, query_embedding: List[float], limit: int = 3) -> List[Dict[str, Any]]:
        """
        Searches ChromaDB for the closest chunks matching the query embedding.
        Implements VectorStoreInterface.
        """
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit
        )
        
        formatted_results = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0]
            ids = results["ids"][0]
            
            for i in range(len(docs)):
                formatted_results.append({
                    "id": ids[i],
                    "text": docs[i],
                    "metadata": metas[i],
                    "score": 1.0 - distances[i]  # Convert distance to similarity score
                })
                
        return formatted_results
