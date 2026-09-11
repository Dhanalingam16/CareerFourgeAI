import io
import logging
from typing import Optional

logger = logging.getLogger("readyrole.ai.extractor")

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extracts plain text from uploaded PDF or DOCX binary data.
    Raises ValueError if document format is unsupported or text extraction yields empty content.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Could not extract readable text from this resume.")

    lower_name = (filename or "").lower()
    extracted_text = ""

    if lower_name.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for page in reader.pages:
                txt = page.extract_text()
                if txt:
                    pages_text.append(txt)
            extracted_text = "\n".join(pages_text).strip()
        except Exception as e:
            logger.error(f"PDF text extraction error: {e}")
            raise ValueError("Could not extract readable text from this resume.")

    elif lower_name.endswith(".docx") or lower_name.endswith(".doc"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(c.text.strip() for c in row.cells if c.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            extracted_text = "\n".join(paragraphs).strip()
        except Exception as e:
            logger.error(f"DOCX text extraction error: {e}")
            raise ValueError("Could not extract readable text from this resume.")

    else:
        # Fallback raw UTF-8 text attempt
        try:
            extracted_text = file_bytes.decode("utf-8").strip()
        except Exception:
            raise ValueError("Could not extract readable text from this resume.")

    if not extracted_text or len(extracted_text.strip()) < 15:
        raise ValueError("Could not extract readable text from this resume.")

    return extracted_text
