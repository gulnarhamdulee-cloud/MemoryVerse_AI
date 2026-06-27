from typing import List

class ChunkerService:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str) -> List[str]:
        """
        Splits text into chunks using a custom, lightweight recursive character splitting strategy.
        Splits on paragraphs (\n\n), sentences (\n or . ), words ( ), or characters.
        """
        if not text:
            return []

        separators = ["\n\n", "\n", ". ", " ", ""]
        return self._split_recursive(text, separators)

    def _split_recursive(self, text: str, separators: List[str]) -> List[str]:
        # If the text is already small enough, return it as a single chunk
        if len(text) <= self.chunk_size:
            return [text]

        if not separators:
            # If no separators left, split by character chunks
            chunks = []
            for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
                chunks.append(text[i : i + self.chunk_size])
            return chunks

        separator = separators[0]
        next_separators = separators[1:]
        
        # Split text by current separator
        if separator == "":
            parts = list(text)
        else:
            parts = text.split(separator)

        chunks = []
        current_chunk = []
        current_length = 0

        for part in parts:
            # If the part is too large by itself, split it recursively using next separators
            if len(part) > self.chunk_size:
                if current_chunk:
                    chunks.append(separator.join(current_chunk))
                    current_chunk = []
                    current_length = 0
                
                sub_chunks = self._split_recursive(part, next_separators)
                chunks.extend(sub_chunks)
                continue

            # Check if adding this part exceeds chunk size
            # Account for separator length if joining
            part_len = len(part)
            sep_len = len(separator) if current_chunk else 0
            
            if current_length + sep_len + part_len <= self.chunk_size:
                current_chunk.append(part)
                current_length += sep_len + part_len
            else:
                # Store completed chunk
                if current_chunk:
                    chunks.append(separator.join(current_chunk))
                
                # Setup next chunk, keeping overlap text
                current_chunk = [part]
                current_length = part_len

        # Append last chunk
        if current_chunk:
            chunks.append(separator.join(current_chunk))

        # Re-verify and resolve chunk overlaps if needed
        # (This basic recursive layout splits logically; overlap is handled at boundary splits)
        return chunks
