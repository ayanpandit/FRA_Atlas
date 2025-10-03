# Deploying FRA_Atlas to Render.com

This guide helps you deploy both the frontend (static Vite build) and the single combined backend (Flask app in `ocr_ner_map.py`) to Render.

Overview
- Frontend: static site (Vite build output in `frontend/dist`).
- Backend: single Flask web service (`backend/ocr_ner_map.py`) that exposes endpoints `/analyze`, `/extract`, `/download_image`, `/health`, `/`.

Files added to support deployment
- `render.yaml` - Render manifest defining services (frontend static + backend web service).
- `backend/requirements.txt` - Python dependencies.
- `backend/Procfile` - optional Procfile for other PaaS providers.
- `backend/Dockerfile` - optional Dockerfile for container-based deploys.

Render setup steps
1. Create a new Render account and connect your GitHub repository.
2. In the Render dashboard, create a new Web Service using the `render.yaml` manifest (choose `Create from render.yaml` in repo).

Environment variables (set in Render dashboard under each service's "Environment" tab):
- RAPIDAPI_KEY -> (your RapidAPI key for OCR service)
- GEMINI_API_KEY -> (your Gemini/Google key)
- VITE_SUPABASE_URL -> (frontend + backend use this)
- VITE_SUPABASE_ANON_KEY -> (frontend)
- GOOGLE_EARTH_ENGINE_PROJECT -> (for Earth Engine initialization if needed)
- DATABASE_URL -> (if you use a database from Render or external Supabase)

Important CORS and backend URL variables:
- FRONTEND_URL -> The public URL of your frontend service (e.g. https://fra-atlas.onrender.com). Set this for the backend so CORS will only allow that origin.
- VITE_BACKEND_URL -> The public URL of your backend web service (e.g. https://fra-atlas-backend.onrender.com). Set this for the frontend so API calls use the correct production URL.

When both are set, the backend will restrict CORS to the `FRONTEND_URL` and the frontend will call the backend via `VITE_BACKEND_URL`.

Notes & troubleshooting
- Earth Engine: The code initializes Earth Engine with `ee.Initialize(project=...)`. For production, ensure the Render instance has service account credentials and the Earth Engine command-line auth has been performed. This often requires running `ee.Authenticate()` locally and providing credentials in the environment or using a service account JSON file mounted as a secret.
- Gemini & external APIs: Store keys in Render environment variables, never commit them to the repo.
- Memory/timeouts: Some Earth Engine operations can be heavy; consider adding job queues or background workers for long-running analysis.

Optional: Remove secrets from Git history
If `.env` files were previously committed (and later removed via `.gitignore`), use BFG or `git filter-repo` to scrub secrets from history.

Example PowerShell commands to push the `render.yaml` manifest changes (if you haven't already):
```powershell
git add render.yaml backend/requirements.txt backend/Procfile backend/Dockerfile DEPLOY_RENDER.md
git commit -m "chore: add Render deployment manifest and backend deployment files"
git push origin main
```

If you want, I can:
- Prepare a minimal `.secrets/` README showing how to place Earth Engine service account JSON on Render using their secrets feature.
- Convert the backend into a Gunicorn-friendly entrypoint module (already done by using `ocr_ner_map:app`).
- Update the Dockerfile to include OS libs required by earthengine-api and OpenCV.

