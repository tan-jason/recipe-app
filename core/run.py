#!/usr/bin/env python3

import uvicorn
import sys
import os

# Add the core directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting Recipe Generator API...")
    print(f"📡 Server: http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📖 Docs: http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print(f"🤖 Model: {settings.LLM_MODEL}")
    print(f"🔧 Debug: {settings.DEBUG}")

    try:
        settings.validate()
        print("✅ Configuration validated")
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        sys.exit(1)

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )