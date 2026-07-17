import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend first, then frontend
backend_env = Path(__file__).resolve().parent.parent / ".env"
frontend_env = Path(__file__).resolve().parent.parent.parent / "frontend" / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
elif frontend_env.exists():
    load_dotenv(frontend_env)
else:
    load_dotenv()

# App Config
PORT = int(os.getenv("PORT", 8001))
HOST = os.getenv("HOST", "0.0.0.0")

# Cohere Config
COHERE_API_KEY = (
    os.getenv("COHERE_API_KEY")
    or os.getenv("VITE_COHERE_API_KEY")
    or ""
)

# Email Config
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 465))
EMAIL_SECURE = os.getenv("EMAIL_SECURE", "true").lower() == "true"
EMAIL_SERVICE = os.getenv("EMAIL_SERVICE", "")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")