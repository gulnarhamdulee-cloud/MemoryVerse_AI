import os
import time
import logging
from typing import List
from groq import Groq

logger = logging.getLogger(__name__)

class GroqKeyManager:
    _instance = None
    
    # Default fallback keys list (loaded from environment)
    KEYS: List[str] = []
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(GroqKeyManager, cls).__new__(cls, *args, **kwargs)
            cls._instance.current_index = 0
            cls._instance._load_keys()
            cls._instance._init_client()
        return cls._instance

    def _load_keys(self):
        """Loads keys from environment variable, prioritizing GROQ_KEYS_POOL."""
        pool_str = os.getenv("GROQ_KEYS_POOL")
        if pool_str:
            keys = [k.strip() for k in pool_str.split(",") if k.strip()]
            if keys:
                self.KEYS = keys
                logger.info(f"Successfully loaded {len(self.KEYS)} keys from GROQ_KEYS_POOL")

        # Also prepend single GROQ_API_KEY if configured and not present
        env_key = os.getenv("GROQ_API_KEY")
        if env_key and env_key not in self.KEYS:
            self.KEYS.insert(0, env_key)

    def _init_client(self):
        """Initializes the Groq client with the currently active key index."""
        current_key = self.KEYS[self.current_index]
        self.client = Groq(api_key=current_key)

    def get_client(self) -> Groq:
        """Returns the currently active Groq client."""
        return self.client

    def rotate_key(self) -> Groq:
        """
        Rotates to the next API key in the list (wrapping around if needed),
        re-initializes the client, and returns it.
        Since we are a singleton, updating self.current_index caches the last
        successful key automatically.
        """
        self.current_index = (self.current_index + 1) % len(self.KEYS)
        self._init_client()
        logger.info(f"Rotated to Groq API key index {self.current_index}")
        return self.client

    def execute_with_fallback(self, func, *args, **kwargs):
        """
        Executes a Groq operation, catching API errors, rotating keys on failure,
        and applying exponential backoff between retries.
        """
        total_keys = len(self.KEYS)
        last_error = None
        
        for attempt in range(total_keys):
            client = self.get_client()
            try:
                # Execute operation
                return func(client, *args, **kwargs)
            except Exception as e:
                last_error = e
                logger.warning(
                    f"Groq API call failed using key at index {self.current_index}. "
                    f"Error: {str(e)}. Rotating key..."
                )
                self.rotate_key()
                
                # Apply exponential backoff (e.g. 1.5^attempt seconds, capped at 10 seconds)
                backoff = min(10.0, 1.5 ** attempt)
                time.sleep(backoff)
                
        # If we exhausted all keys, raise the last exception
        if last_error is not None:
            raise last_error
        raise RuntimeError("All keys in the fallback pool failed.")
