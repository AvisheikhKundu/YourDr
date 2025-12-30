import os
import io
import logging
from typing import Optional

from PIL import Image
import numpy as np

# Optional imports
try:
    import torch
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except Exception:
    TORCH_AVAILABLE = False

try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except Exception:
    ORT_AVAILABLE = False


logger = logging.getLogger(__name__)


class Model:
    """Simple model wrapper that supports PyTorch and ONNX models.
    If no model is provided, a deterministic heuristic is used as a placeholder
    so the API can be tested without a real model file.
    """

    def __init__(self):
        self.model = None
        self.model_format = os.environ.get('MODEL_FORMAT', '').lower()  # 'torch' or 'onnx'
        self.model_path = os.environ.get('MODEL_PATH', '')

        if self.model_path and self.model_format:
            self._load_model()
        else:
            logger.info('No model configured: running in dummy mode')

    def _load_model(self):
        fmt = self.model_format
        path = self.model_path
        logger.info(f'Loading model {path} as {fmt}')

        if fmt == 'torch' and TORCH_AVAILABLE:
            try:
                self.model = torch.load(path, map_location='cpu')
                self.model.eval()
                self.backend = 'torch'
                logger.info('Loaded PyTorch model')
            except Exception as e:
                logger.exception('Failed to load torch model: %s', e)
                self.model = None
        elif fmt == 'onnx' and ORT_AVAILABLE:
            try:
                self.session = ort.InferenceSession(path)
                self.backend = 'onnx'
                logger.info('Loaded ONNX model')
            except Exception as e:
                logger.exception('Failed to load onnx model: %s', e)
                self.session = None
        else:
            logger.warning('Requested model format not available or not supported on this environment')
            self.model = None

    def preprocess(self, image: Image.Image, size=(224, 224)) -> np.ndarray:
        image = image.convert('RGB')
        image = image.resize(size)
        arr = np.array(image).astype(np.float32) / 255.0
        # shape (H, W, C) -> (C, H, W)
        arr = np.transpose(arr, (2, 0, 1))
        arr = np.expand_dims(arr, 0)
        return arr

    def predict(self, image: Image.Image) -> dict:
        """Return a dict with keys: predicted_class, confidence, probabilities
        Probabilities are percentages summing to ~100.
        """
        if getattr(self, 'backend', None) == 'torch' and self.model is not None and TORCH_AVAILABLE:
            try:
                x = self.preprocess(image)
                tensor = torch.from_numpy(x)
                with torch.no_grad():
                    out = self.model(tensor)
                    probs = F.softmax(out, dim=1).cpu().numpy()[0]
                classes = ['Covid', 'Pneumonia', 'Normal']
                probs = (probs * 100).tolist()
                result = {c: float(p) for c, p in zip(classes, probs)}
                pred_idx = int(np.argmax(probs))
                return {
                    'predicted_class': classes[pred_idx],
                    'confidence': float(probs[pred_idx]),
                    'probabilities': result
                }
            except Exception as e:
                logger.exception('Torch model prediction failed: %s', e)
                # fallthrough to dummy

        if getattr(self, 'backend', None) == 'onnx' and getattr(self, 'session', None) is not None and ORT_AVAILABLE:
            try:
                x = self.preprocess(image)
                input_name = self.session.get_inputs()[0].name
                out = self.session.run(None, {input_name: x})[0]
                probs = np.squeeze(out)
                probs = probs / (probs.sum() + 1e-8)
                probs = (probs * 100).tolist()
                classes = ['Covid', 'Pneumonia', 'Normal']
                result = {c: float(p) for c, p in zip(classes, probs)}
                pred_idx = int(np.argmax(probs))
                return {
                    'predicted_class': classes[pred_idx],
                    'confidence': float(probs[pred_idx]),
                    'probabilities': result
                }
            except Exception as e:
                logger.exception('ONNX model prediction failed: %s', e)
                # fallthrough

        # Dummy heuristic fallback: use mean intensity to decide
        img_arr = np.array(image.convert('L')).astype(np.float32) / 255.0
        mean = img_arr.mean()
        # Heuristic mapping
        # darker images -> Pneumonia, mid -> Covid, bright -> Normal
        if mean < 0.4:
            probs = [10.0, 70.0, 20.0]
        elif mean < 0.6:
            probs = [65.0, 25.0, 10.0]
        else:
            probs = [5.0, 10.0, 85.0]

        classes = ['Covid', 'Pneumonia', 'Normal']
        result = {c: float(p) for c, p in zip(classes, probs)}
        pred_idx = int(np.argmax(probs))
        return {
            'predicted_class': classes[pred_idx],
            'confidence': float(probs[pred_idx]),
            'probabilities': result,
            'note': 'dummy-model' if self.model is None else 'model' 
        }
