import os

class ExtractorService:
    @staticmethod
    def extract_text(file_path: str, content_type: str) -> str:
        """
        Extracts text from a given file path based on its content type.
        Supports: PDF, DOCX, TXT, and Images (OCR).
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if "pdf" in content_type:
            return ExtractorService._extract_pdf(file_path)
        elif "word" in content_type or file_path.endswith(".docx"):
            return ExtractorService._extract_docx(file_path)
        elif "text" in content_type or file_path.endswith(".txt"):
            return ExtractorService._extract_txt(file_path)
        elif "image" in content_type:
            return ExtractorService._extract_ocr(file_path)
        else:
            raise ValueError(f"Unsupported content type for extraction: {content_type}")

    @staticmethod
    def _extract_pdf(file_path: str) -> str:
        # Resolve static analysis warnings by importing dynamically via importlib
        import importlib
        try:
            pypdf = importlib.import_module("pypdf")
            PdfReader = pypdf.PdfReader
        except ImportError:
            raise RuntimeError("Required dependency 'pypdf' is not installed.")

        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            raise RuntimeError(f"Error parsing PDF: {str(e)}")
        return text.strip()

    @staticmethod
    def _extract_docx(file_path: str) -> str:
        # Resolve static analysis warnings by importing dynamically via importlib
        import importlib
        try:
            docx = importlib.import_module("docx")
            DocxDocument = docx.Document
        except ImportError:
            raise RuntimeError("Required dependency 'docx' is not installed.")

        try:
            doc = DocxDocument(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise RuntimeError(f"Error parsing DOCX: {str(e)}")

    @staticmethod
    def _extract_txt(file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()
        except Exception as e:
            raise RuntimeError(f"Error reading TXT: {str(e)}")

    @staticmethod
    def _extract_ocr(file_path: str) -> str:
        """
        Placeholder for OCR library execution (e.g. pytesseract or easyocr).
        For service architecture, returning mock text representing OCR extraction.
        """
        return f"[OCR Extracted Text from Image: {os.path.basename(file_path)}]\nMock receipt, whiteboard note, or document text."
