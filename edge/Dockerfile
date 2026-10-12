FROM python:3.11-slim

WORKDIR /app

# CPU-only ONNX Runtime — do NOT install onnxruntime-gpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure the outbox data directory exists
RUN mkdir -p /data

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
