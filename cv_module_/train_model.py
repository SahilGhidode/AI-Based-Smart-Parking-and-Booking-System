#!/usr/bin/env python3
"""
train_model.py

Train an object-detection model (YOLO) for parking lot / vehicle detection.
Using a local dataset (downloaded from Kaggle) in YOLO format.

Usage example:
  python train_model.py --local-data /path/to/dataset/data.yaml --weights yolov8n.pt --epochs 20 --device cpu
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# ---- Defaults ----
DEFAULT_PRETRAINED = "yolov8n.pt"   # lightweight for CPU
DEFAULT_EPOCHS = 30
DEFAULT_IMGSZ = 640
DEFAULT_BATCH = 8  # small for CPU

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
log = logging.getLogger("train_model")

def ensure_packages():
    missing = []
    try:
        import ultralytics  # noqa
    except ImportError:
        missing.append("ultralytics==8.0.20")
    if missing:
        log.error("Missing Python packages: %s", ", ".join(missing))
        log.info("Install them with:\n    pip install %s", " ".join(missing))
        sys.exit(1)

def train_yolo(data_yaml_path: str, model_weights: str, epochs: int, imgsz: int, batch: int, device: str):
    from ultralytics import YOLO
    log.info("Starting YOLO training: model=%s, data=%s, epochs=%d, imgsz=%d, batch=%d, device=%s",
             model_weights, data_yaml_path, epochs, imgsz, batch, device)
    model = YOLO(model_weights)
    train_kwargs = dict(
        data=str(data_yaml_path),
        epochs=int(epochs),
        imgsz=int(imgsz),
        batch=int(batch),
        device=device,
        workers=0,      # reduce multiprocessing issues on CPU
        patience=50,
        verbose=True
    )
    model.train(**train_kwargs)
    log.info("Training done. Check runs/detect/train for output.")

def parse_args():
    parser = argparse.ArgumentParser(description="Train YOLO model for parking/vehicle detection with local dataset")
    parser.add_argument("--local-data", required=True,
                        help="Path to dataset YAML file (YOLO format) e.g. /path/to/data.yaml")
    parser.add_argument("--weights", default=DEFAULT_PRETRAINED,
                        help="Pretrained weights (e.g., yolov8n.pt)")
    parser.add_argument("--epochs", default=DEFAULT_EPOCHS, type=int)
    parser.add_argument("--imgsz", default=DEFAULT_IMGSZ, type=int)
    parser.add_argument("--batch", default=DEFAULT_BATCH, type=int)
    parser.add_argument("--device", default="cpu",
                        choices=["cpu", "0", "1"], help="Device to train on (use 'cpu' if no GPU)")
    return parser.parse_args()

def main():
    args = parse_args()
    ensure_packages()

    # Check local-data YAML
    data_yaml = Path(args.local_data).resolve()
    if not data_yaml.exists():
        log.error("Local data YAML path not found: %s", data_yaml)
        sys.exit(1)
    log.info("Using local dataset yaml: %s", data_yaml)

    train_yolo(data_yaml_path=str(data_yaml),
               model_weights=args.weights,
               epochs=args.epochs,
               imgsz=args.imgsz,
               batch=args.batch,
               device=args.device)

if __name__ == "__main__":
    main()



# python train_model.py --local-data data/dataset.yaml --weights yolov8n.pt --epochs 20 --device cpu