from typing import List

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _get_model(self):
        """
        Lazy-loads the SentenceTransformer model on first invocation to prevent
        blocking the FastAPI application startup while the model is downloaded/loaded.
        """
        if self._model is None:
            # Resolve static linter checking and delay import
            import importlib
            try:
                transformers = importlib.import_module("sentence_transformers")
                SentenceTransformer = transformers.SentenceTransformer
            except ImportError:
                raise RuntimeError("Required dependency 'sentence-transformers' is not installed.")
                
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates list of vectors representing the input texts using all-MiniLM-L6-v2.
        """
        if not texts:
            return []
        
        model = self._get_model()
        embeddings = model.encode(texts, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]

    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generates a single query vector representation.
        """
        return self.generate_embeddings([query])[0]
