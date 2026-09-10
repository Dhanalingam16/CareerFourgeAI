import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load backend/.env before reading configuration.
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "CareerFourge AI Job Readiness Engine"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careerfourge.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")

settings = Settings()
