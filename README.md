# Moderato-BERT

Moderato-BERT is a Vite + React customer feedback intelligence dashboard with a Vercel serverless API.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in any services you want enabled.

3. Start the local full-stack dev server:

   ```bash
   npm run dev
   ```

The app runs on `http://localhost:3000`.

## Vercel Deployment

This repo is deploy-ready for Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Frontend: Vite SPA
- API: `api/index.ts` serverless Express handler
- SPA fallback and `/api/*` routing are configured in `vercel.json`

Add these environment variables in Vercel Project Settings:

```text
CLAUDE_API_KEY
GEMINI_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Only the `VITE_*` values are exposed to the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Useful Commands

```bash
npm run build
npm run build:server
npm run build:all
npm run lint
```

## Database

Run `database_schema.sql` in Supabase before enabling persistence. The API still works without Supabase configured by returning demo data and using heuristic fallback analysis when no AI key is available.

## ML Service

`ml-service/` contains an optional FastAPI service for non-Vercel deployments. Vercel will not run that Docker service automatically; the deployed Vercel app uses `api/index.ts`.
