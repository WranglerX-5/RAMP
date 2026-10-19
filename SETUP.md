# RAMP Setup & Development

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

## Local Development

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local with Supabase credentials
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
npm run dev
```

Frontend runs on `http://localhost:5173`

The frontend dev server automatically proxies `/api/` requests to the backend on port 3001.

## Deployment

### Supabase Setup (one-time)
1. Create free Supabase account at supabase.com
2. Create a new project (free tier, 500MB)
3. Run database migrations (see `backend/migrations/`)
4. Copy project credentials to `.env`

### Netlify Deployment
1. Create new Netlify site pointing to `maintenance.rotoradventures.xyz`
2. Connect to GitHub repo
3. Build command: `npm run build`
4. Publish directory: `frontend/dist/`
5. Functions directory: `backend/netlify-functions/`
6. Set environment variables in Netlify UI

## Database Schema
- `aircrafts` — Aircraft registry
- `maintenance_logs` — Maintenance entries
- `expenditures` — Parts/labor costs
- `due_dates` — Maintenance due dates and alerts

See `backend/migrations/` for full schema.
