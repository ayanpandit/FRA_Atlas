# FRA Atlas Backend

This folder contains the Flask API that powers the land analysis workflows.

## Local development

1. Create and activate a virtual environment (Python 3.10+ is recommended).
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Create a copy of `.env.example` named `.env` and fill in the required secrets (RapidAPI key, Gemini key, Supabase credentials, etc.).
4. If you have not authenticated the Google Earth Engine CLI on this machine, run `earthengine authenticate` once and follow the browser workflow.
5. Start the server:
   ```powershell
   python ocr_ner_map.py
   ```
6. The API will be available on `http://localhost:5000` by default.

## Deploying to Render

1. Push the repository (with this folder) to GitHub.
2. In the Render dashboard choose **New ➜ Web Service** and pick the repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn ocr_ner_map:app`
   - **Environment**: `Python 3`
4. Add the required environment variables under **Environment ➜ Secret Files/Variables**:
   - `RAPIDAPI_KEY`
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other values from `.env.example`
5. For Google Earth Engine you must deploy using a service account (headless auth). Upload the service account JSON to Render as a Secret File (e.g. `/etc/secrets/ee-service-account.json`) and set:
   - `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/ee-service-account.json`
   - `EE_PROJECT_ID=<your-earth-engine-project-id>` (if different from the default in code)
6. Trigger a deploy. Render will automatically install the dependencies, start Gunicorn, and expose the Flask API.
7. After the deploy completes, copy the Render-provided URL (e.g. `https://fra-backend.onrender.com`) for use in the frontend.

### CORS

The backend currently allows all origins via `flask_cors`. You can restrict this by setting `FRONTEND_URL` in your `.env` and updating the CORS configuration if needed.

## Frontend integration

Set `VITE_BACKEND_URL` in the frontend `.env` files:

- For local development: `VITE_BACKEND_URL=http://localhost:5000`
- For production builds (e.g. deployed static hosting): `VITE_BACKEND_URL=https://your-render-service.onrender.com`

The `map_land_analysis.jsx` page now uses a centralized helper so no code changes are needed when you switch environments—only the env variable must change.
