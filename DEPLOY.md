# Deploying Lumen

Lumen is two pieces that deploy to two hosts:

| Piece | Host | Why |
|-------|------|-----|
| **Frontend** (React/Vite) | **Vercel** | Static site — Vercel's sweet spot |
| **Backend** (Node + Python tools) | **Render** (or Railway/Fly) | Spawns Python processes (Maigret/Holehe/social-analyzer) and needs 30–120s requests — impossible on Vercel serverless |

Everything is already configured: `Dockerfile` + `render.yaml` for the backend, `vercel.json` + `VITE_API_URL` for the frontend.

---

## Step 0 — Put the code on GitHub (needed by both hosts)

```bash
cd osint-app
# create a repo on github.com first (private is fine), then:
git remote add origin https://github.com/<you>/lumen.git
git push -u origin main
```

`.env` is gitignored, so your API keys are NOT pushed. Good.

---

## Step 1 — Backend on Render

1. Go to **render.com** → **New → Blueprint** → connect the repo. Render reads `render.yaml`.
2. It creates a Docker web service `lumen-backend`. Set the two secret env vars when prompted:
   - `APIFY_TOKEN`
   - `ANTHROPIC_API_KEY`
   (`ANTHROPIC_MODEL` is preset to `claude-opus-4-8`; change to `claude-haiku-4-5` to cut cost.)
3. Deploy. First build takes a few minutes (it installs Python + the OSINT tools).
4. Copy the service URL, e.g. `https://lumen-backend.onrender.com`.
5. Verify: open `https://lumen-backend.onrender.com/api/health` → should return `{"ok":true,...}`.

> **Free tier note:** the service sleeps after ~15 min idle and cold-starts (~30–50s) on the next request. Fine for demos; upgrade to a paid instance for an always-on demo.

---

## Step 2 — Frontend on Vercel

**Option A — Dashboard (simplest):**
1. **vercel.com** → **Add New → Project** → import the repo.
2. Set **Root Directory** = `frontend`.
3. Add an env var: `VITE_API_URL` = your Render URL (no trailing slash), e.g. `https://lumen-backend.onrender.com`.
4. Deploy.

**Option B — CLI (from this machine):**
```bash
vercel login                      # one-time, opens browser
cd osint-app/frontend
vercel --prod \
  --build-env VITE_API_URL=https://lumen-backend.onrender.com
```

---

## Step 3 — Smoke test the live site
Open your Vercel URL → **Launch Console** → search `natgeo` → **Analyze Instagram**.
(If the first request is slow, that's the Render free-tier cold start.)

---

## Notes
- **CORS** is open on the backend (`cors()`), so the Vercel domain can call it out of the box. Lock it to your domain later if you want.
- **Keys live only on Render**, never in the frontend bundle. The frontend only knows the backend URL.
- **Rotate** the Apify and Anthropic keys before any real (non-demo) use — they were shared in chat during development.
