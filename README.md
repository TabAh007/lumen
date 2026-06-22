# Lumen — Social Media Interest & Stance Intelligence

OSINT demo: type a social handle → discover where the person exists online → pull their public
posts → get an evidence-backed read on their interests and pro/anti stances.

**Pipeline:** Maigret (discovery) → Apify (Instagram/TikTok content) → Claude (analysis) → React UI.

Every stance is shown with **quoted evidence + a confidence score** — never a bare verdict.

## Prerequisites
- Node.js 18+
- Python 3.10+ (for Maigret discovery)
- An [Apify](https://apify.com) token (free tier) and an [Anthropic](https://console.anthropic.com) API key

## Setup

```bash
# 1. Backend deps
cd backend && npm install

# 2. Python OSINT tools (discovery + email lookup) in an isolated venv
cd .. && python3 -m venv maigret-venv && ./maigret-venv/bin/pip install maigret holehe

# 3. Frontend deps
cd frontend && npm install

# 4. Configure keys
cp backend/.env.example backend/.env   # then fill in APIFY_TOKEN and ANTHROPIC_API_KEY
```

## Run (two terminals)

```bash
# Terminal 1 — backend (port 5050)
cd backend && npm start

# Terminal 2 — frontend (port 5173, proxies /api to the backend)
cd frontend && npm run dev
```

Open http://localhost:5173 and search a handle (try `natgeo`).

## Configuration (`backend/.env`)
| Var | Purpose |
|-----|---------|
| `APIFY_TOKEN` | Instagram + TikTok scraping |
| `ANTHROPIC_API_KEY` | Claude analysis |
| `ANTHROPIC_MODEL` | Defaults to `claude-opus-4-8`; set `claude-haiku-4-5` to cut cost ~5× |
| `MONGODB_URI` | Optional; app runs in-memory without it |

## API
- `POST /api/discover` `{ handle }` → platforms found (Maigret)
- `POST /api/collect` `{ platform, handle }` → normalized profile + posts (Apify)
- `POST /api/analyze` `{ handle, profile, posts }` → interests + evidence-backed stances (Claude)
- `POST /api/email-lookup` `{ email }` → which platforms have an account registered to this email (Holehe)

## Notes
- **Public data only.** Designed for authorized security/threat-intel use. Mind GDPR/CCPA on retention.
- Stance detection is probabilistic — always review the quoted evidence before acting.
