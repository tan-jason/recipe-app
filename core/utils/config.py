import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Google AI Configuration
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-pro-latest")

    # ElevenLabs Configuration
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default: Rachel

    # Google Cloud Speech-to-Text Configuration
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # CORS Configuration
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

    def validate(self):
        """Validate required configuration"""
        if not self.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        return True

settings = Settings()