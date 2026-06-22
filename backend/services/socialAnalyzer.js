// Social Analyser service — wraps QeeqBox social-analyzer (username -> detected
// profiles with confidence rate + website category) via the Python bridge.
// Independent of the handle pipeline and the email lookup.

const { spawn } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VENV_PYTHON =
  process.env.SA_PYTHON || path.join(PROJECT_ROOT, 'maigret-venv', 'bin', 'python');
const BRIDGE = path.join(__dirname, '..', 'social_analyzer_bridge.py');

const USERNAME_RE = /^[A-Za-z0-9._-]{1,64}$/;

function platformFromLink(link) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    const base = host.split('.').slice(-2, -1)[0] || host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return link;
  }
}

function parseRate(rate) {
  // social-analyzer formats rate like "%100.0"
  const n = parseFloat(String(rate).replace('%', ''));
  return Number.isFinite(n) ? n : null;
}

async function analyze(username, { top = 50, timeout = 7 } = {}) {
  if (!USERNAME_RE.test(username)) {
    const err = new Error('Invalid username format');
    err.status = 400;
    throw err;
  }

  const raw = await runBridge(username, top, timeout);
  if (raw && raw.error) throw new Error(`social-analyzer failed: ${raw.error}`);

  const profiles = raw
    .map((d) => ({
      platform: platformFromLink(d.link),
      link: d.link,
      category: d.type && d.type !== 'unavailable' ? d.type : null,
      rate: parseRate(d.rate),
      title: d.title || null,
      country: d.country || null,
    }))
    .filter((p) => p.link)
    .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

  return { username, count: profiles.length, profiles };
}

function runBridge(username, top, timeout) {
  return new Promise((resolve, reject) => {
    const proc = spawn(VENV_PYTHON, [BRIDGE, username, String(top), String(timeout)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (e) =>
      reject(new Error(`Failed to launch social-analyzer bridge (${VENV_PYTHON}): ${e.message}`))
    );
    proc.on('close', (code) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`social-analyzer bridge bad output (code ${code}): ${stderr.slice(-300)}`));
      }
    });
  });
}

module.exports = { analyze };
