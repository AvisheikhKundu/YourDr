# YourDr Backend (FastAPI)

This directory contains a minimal FastAPI backend for running chest x-ray (CXR) inference.

Features:
- /predict endpoint that accepts image uploads and returns predictions
- Model wrapper that supports PyTorch and ONNX (falls back to a deterministic dummy)
- Dockerfile for containerization

Quick start (development):

1. Create a virtualenv and install requirements

   python -m venv .venv
   . \.venv\Scripts\activate
   pip install -r requirements.txt

2. Configure your model in `.env` (copy `.env.example`) or export env vars:

   set MODEL_PATH=path\to\model.onnx
   set MODEL_FORMAT=onnx

3. Run the app:

   uvicorn app.main:app --reload

4. Open `http://localhost:8000` (root returns status)

Notes on GPU:
- For PyTorch GPU inference, install the appropriate `torch` build and run on a CUDA-enabled host.
- For ONNX GPU, use `onnxruntime-gpu` instead of `onnxruntime`.

