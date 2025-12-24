#!/bin/bash
PORT=${PORT:-8000}
# Extract only numeric characters from PORT
CLEAN_PORT=$(echo "$PORT" | sed 's/[^0-9]*//g' | sed 's/^0*//')
if [ -z "$CLEAN_PORT" ]; then
  CLEAN_PORT=8000
fi
echo "Starting server on port: $CLEAN_PORT"
exec uvicorn app.main:app --host 0.0.0.0 --port $CLEAN_PORT --reload