# SmartParking — Setup & Run Instructions

Overview: this repository has three main parts:
- `Backend/` — Node.js Express backend (Postgres DB integration)
- `Frontend/` — Next.js React frontend
- `ml_module_/` and `cv_module_/` — Python ML and CV modules

This file explains how to create the Python virtual environment `smart_parking`, install core Python packages, and start each component.

1) Create Python venv and install core ML packages (PowerShell)

  Open PowerShell at the repo root and run:

  .\setup_env.ps1

  This creates the venv folder `smart_parking`, activates it in the current shell, upgrades pip and installs core packages listed in `requirements_ml.txt`.

2) Install PyTorch and Ultralytics (manual step)

  PyTorch installation depends on your OS and whether you want CUDA (GPU) support. Visit https://pytorch.org/get-started/locally/ to get the correct command. For example, for CPU-only on Windows with pip:

  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

  After installing the appropriate `torch`, install Ultralytics YOLO:

  pip install ultralytics

3) Train models (optional)

  With venv activated, run:

  python ml_module_/train_models.py

  That will create `models/` files used by the inference API and `simple_test.py`.

4) Run the inference API

  With venv activated, run:

  python ml_module_/inference_api.py

  Or use Uvicorn directly (with autoreload during development):

  uvicorn ml_module_.inference_api:app --host 0.0.0.0 --port 8000 --reload

5) Start Backend (Node.js)

  Ensure you have Node >= 18 and npm installed. In a separate terminal:

  cd Backend
  npm install
  npm run server

  This runs `nodemon src/server.js` (see `Backend/package.json`). If you don't want `nodemon` use `node src/server.js`.

6) Start Frontend (Next.js)

  In another terminal:

  cd Frontend
  npm install
  npm run dev

  Frontend dev server runs on the port printed by Next (usually 3000).

7) Notes and troubleshooting

- Database: `Backend/config/db.js` likely expects Postgres connection env vars. Create a `.env` in `Backend/` with your DB connection string and other secrets.
- YOLO/video: `cv_module_/final_slot_detection.py` expects `yolov8n.pt` and a video file path (example `parking1.mp4`). Ensure those files exist in `cv_module_/` or update paths.
- If you hit errors installing `xgboost` on Windows, consider installing a prebuilt wheel or use `pip install --prefer-binary xgboost`.
- If GUI windows (OpenCV) fail in headless environments, the scripts will save a frame instead.

If you'd like, I can now create the virtual environment here in this workspace and install the core packages (this will download packages and may take several minutes). Do you want me to proceed? (Yes / No)