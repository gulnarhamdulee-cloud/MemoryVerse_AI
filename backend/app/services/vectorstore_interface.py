from abc import ABC, abstractmethod
from typing import List, Dict, Any

class VectorStoreInterface(ABC):
    @abstractmethod
    def add_documents(
        self, 
        document_id: str, 
        chunks: List[str], 
        embeddings: List[List[float]], 
        metadata: Dict[str, Any]
    ) -> None:
        """
        Stores document text chunks, their embeddings, and associated metadata.
        Each chunk is stored along with its document_id and chunk_id.
        """
        pass

    @abstractmethod
    def search_similar(
        self, 
        query_embedding: List[float], 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Performs similarity search against the stored vectors and returns closest matches.
        """
        pass
