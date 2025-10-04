# FRA Atlas Frontend

React + Vite single page application that powers the FRA Atlas experience, including the satellite land analysis dashboard, patta management workflows, and Supabase-backed data views.

This folder is ready to be built and hosted as a static site (Render Static, Netlify, Vercel, Cloudflare Pages, S3, etc.). The backend API URL and Supabase credentials are supplied through Vite environment variables.

## Requirements

- Node.js 18+
- npm 9+
- A configured Supabase project (URL + anon key)
- The deployed backend API URL (e.g. Render web service running `ocr_ner_map.py`)

## Environment configuration

Create a `.env` for local development and a `.env.production` for static builds.

Key variables:

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase instance URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_BACKEND_URL` | Base URL for the Flask backend (defaults to `http://localhost:5000` if unset) |

Use `.env.production.example` as a template when preparing production values.

## Local development

```powershell
npm install
npm run dev
# opens http://localhost:5173
```

The frontend automatically reads `VITE_BACKEND_URL`. If you are running the backend locally, ensure it is available on `http://localhost:5000` or adjust the variable accordingly.

## Build and preview locally

```powershell
# Optional: set production env overrides
copy .env.production.example .env.production

npm run build
npm run preview
```

`npm run preview` serves the generated static files from `dist/` so you can validate the build before deploying.

## Deploying as a static site

1. Set `VITE_BACKEND_URL` in `.env.production` to the hosted backend (e.g. `https://fra-backend.onrender.com`).
2. Run `npm run build`. The static bundle is emitted to `dist/`.
3. Upload the `dist/` folder to your static host of choice.

### Render Static Sites

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variables:** add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`
- Render automatically serves `dist/index.html`. The included `_redirects` file ensures SPA routes fall back to the React app.

### Netlify / Cloudflare Pages / Vercel

- Add the same build command and publish directory.
- For Netlify, the `public/_redirects` file (`/* /index.html 200`) handles client-side routing.
- For Vercel, set a single catch-all rewrite to `/index.html` if you prefer configuration instead of `_redirects`.

## Linting

```powershell
npm run lint
```

## Notes

- `vite.config.js` sets `base: './'` so assets resolve correctly when served from any static hosting origin or CDN.
- React Router requires a SPA fallback; the repository includes `public/_redirects` for hosts that honor Netlify-style rules.
- If you change the backend URL after deployment, remember to rebuild the static site so the new value is baked into the bundle.
