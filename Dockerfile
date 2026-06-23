# Backend image: Node (Express API) + Python (Maigret / Holehe / social-analyzer).
# Build context must be the osint-app root.

FROM node:20-bookworm-slim

# Python + libs needed to build/run the OSINT tools (lxml etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    libxml2-dev libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python venv with the OSINT tools — created at /app/maigret-venv, which is where
# the backend services resolve it (PROJECT_ROOT/maigret-venv).
RUN python3 -m venv /app/maigret-venv \
    && /app/maigret-venv/bin/pip install --no-cache-dir --upgrade pip \
    && /app/maigret-venv/bin/pip install --no-cache-dir maigret holehe social-analyzer

# Backend Node dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Backend source
COPY backend ./backend

ENV NODE_ENV=production
# The host (Render) injects PORT; server.js reads process.env.PORT.
EXPOSE 5050
CMD ["node", "backend/server.js"]
