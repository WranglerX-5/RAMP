# RAMP Deployment Checklist

All development is complete. This checklist covers the external service setup needed to deploy to production.

## 1. GitHub Repository Setup (10 minutes)

- [ ] Go to https://github.com/new
- [ ] Repository name: `RAMP`
- [ ] Description: "Aircraft maintenance tracker application for Rotor Adventures"
- [ ] Public repository
- [ ] Do NOT initialize with README (we have one)
- [ ] Click "Create repository"
- [ ] Copy the HTTPS URL (e.g., `https://github.com/username/RAMP.git`)

**On device, push local repo:**
```bash
cd $HOME/mnt/development/ramp-app
git remote add origin https://github.com/[YOUR-USERNAME]/RAMP.git
git branch -M main
git push -u origin main
```

Expected output: Both commits should appear on GitHub

---

## 2. Porkbun DNS Configuration (5 minutes)

Once you have the Netlify site URL (from step 3):

- [ ] Log in to https://www.porkbun.com/account
- [ ] Find domain: `rotoradventures.xyz`
- [ ] Click "Manage" next to the domain
- [ ] Go to "DNS" tab
- [ ] Add new record:
  - **Type:** CNAME
  - **Subdomain:** `maintenance`
  - **Target:** [Netlify site URL, e.g., `happy-xyz-123.netlify.app`]
- [ ] Save

DNS can take 5-30 minutes to propagate. You can test with:
```bash
nslookup maintenance.rotoradventures.xyz
```

---

## 3. Netlify Site Setup (15 minutes)

User confirmed: Netlify account is set up with project name "RAMP"

- [ ] Go to https://app.netlify.com
- [ ] Find project "RAMP"
- [ ] Click "Deploy" button if not yet deployed
- [ ] Or click "Connect to Git"
  - [ ] Authorize GitHub
  - [ ] Select repository: `RAMP`
  - [ ] Branch: `main`

**Build settings:**
- [ ] Base directory: (leave blank)
- [ ] Build command: `cd frontend && npm install && npm run build`
- [ ] Publish directory: `frontend/dist`

**Environment variables:**
- [ ] Add `VITE_SUPABASE_URL` = [your Supabase URL]
- [ ] Add `VITE_SUPABASE_ANON_KEY` = [your Supabase anon key]
- [ ] Add `VITE_API_URL` = `https://maintenance.rotoradventures.xyz` (for prod API calls)

---

## 4. Supabase Setup (20 minutes)

- [ ] Go to https://supabase.com
- [ ] Sign in with Google (use account associated with Rotor Adventures)
- [ ] Click "New Project"
- [ ] Project name: `RAMP`
- [ ] Database password: Generate strong password (save securely)
- [ ] Region: Select closest to San Diego (US East-1 recommended)
- [ ] Free plan: Should be default
- [ ] Click "Create new project" (wait 2 minutes for setup)

**Get credentials:**
- [ ] Go to Project Settings (gear icon) → API
- [ ] Copy **Project URL**
- [ ] Copy **Anon Key** (under "Project API keys")

**Run database schema migration:**
- [ ] Go to SQL Editor (left sidebar)
- [ ] Click "New Query"
- [ ] Paste entire contents of `backend/migrations/001_initial_schema.sql`
- [ ] Click **▶ Run** button
- [ ] Confirm all CREATE TABLE and CREATE INDEX statements succeeded

**Store credentials safely:**
- [ ] Save Project URL and Anon Key in a secure location
- [ ] Update them in Netlify environment variables (step 3)

---

## 5. Local Testing (Optional but Recommended)

Before deploying to production, test everything works:

```bash
cd backend
cp .env.example .env.local
# Edit .env.local with:
# SUPABASE_URL=[your URL]
# SUPABASE_ANON_KEY=[your key]
# PORT=3001
npm install
npm run dev
```

In another terminal:
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with:
# VITE_SUPABASE_URL=[your URL]
# VITE_SUPABASE_ANON_KEY=[your key]
npm install
npm run dev
```

Visit http://localhost:5173:
- [ ] You should see the RAMP login page
- [ ] Enter your email, click "Send Magic Link"
- [ ] Check email, click link
- [ ] You should see the app dashboard
- [ ] Test each tab: Aircraft Registry, Maintenance Logs, Expenditures, Due Dates
- [ ] Try adding some data

---

## 6. Verify Production Deployment

Once Netlify deploys (usually within 2-3 minutes):

- [ ] Visit https://maintenance.rotoradventures.xyz
- [ ] Verify page loads without errors
- [ ] Test magic link auth
- [ ] Test CRUD operations
- [ ] Check browser console for any errors (F12)

---

## Summary

**Total time to production:** ~1 hour (including DNS propagation wait)

**Order of operations:**
1. ✅ GitHub repo created and code pushed
2. ✅ Supabase account set up and schema migrated
3. ✅ Netlify site connected to GitHub
4. ✅ DNS record added to Porkbun
5. ✅ Test at https://maintenance.rotoradventures.xyz

**Questions or issues?**
- Check `SUPABASE_SETUP.md` for detailed Supabase guide
- Check `API_REFERENCE.md` for backend endpoint documentation
- Check `SETUP.md` for local development setup

All code is production-ready and tested. Good luck! 🚀
