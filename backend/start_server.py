import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Default to 8000 if PORT not set
    uvicorn.run(app, host="0.0.0.0", port=port)