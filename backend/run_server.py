import os
import re
import uvicorn
from app.main import app

if __name__ == "__main__":
    port_str = os.environ.get("PORT", "8000")
    # Extract only numeric characters to ensure it's a valid port
    port_match = re.search(r'\d+', port_str)
    port = int(port_match.group()) if port_match else 8000
    print(f"Starting server on port: {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)