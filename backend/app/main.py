import io
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .model import Model

logger = logging.getLogger("uvicorn")

app = FastAPI(title="YourDr - CXR Inference")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = Model()


@app.get("/")
async def root():
    return {"status": "ok", "model_loaded": model.model is not None}


@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail='Unable to read image')

    try:
        result = model.predict(image)
        return result
    except Exception as e:
        logger.exception('Prediction failed: %s', e)
        raise HTTPException(status_code=500, detail='Prediction failed')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)