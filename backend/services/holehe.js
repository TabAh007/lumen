// Email-lookup service — wraps Holehe (email -> registered accounts) via the
// Python bridge in ../holehe_bridge.py. Spawns with an argument array (no shell)
// so the email can't inject commands. Normalizes to a stable shape.

const { spawn } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VENV_PYTHON =
  process.env.HOLEHE_PYTHON || path.join(PROJECT_ROOT, 'maigret-venv', 'bin', 'python');
const BRIDGE = path.join(__dirname, '..', 'holehe_bridge.py');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function lookup(email, { timeout = 10 } = {}) {
  if (!EMAIL_RE.test(email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }

  const raw = await runBridge(email, timeout);
  if (raw && raw.error) throw new Error(`Holehe failed: ${raw.error}`);

  const registered = [];
  let rateLimited = 0;
  let errored = 0;

  for (const site of raw) {
    if (site.rateLimit) rateLimited += 1;
    if (site.error) errored += 1;
    if (site.exists) {
      registered.push({
        platform: site.name,
        domain: site.domain || null,
        recoveryHint: site.emailrecovery || null,
        phoneHint: site.phoneNumber || null,
      });
    }
  }

  registered.sort((a, b) => a.platform.localeCompare(b.platform));

  return {
    email,
    checked: raw.length,
    registeredCount: registered.length,
    rateLimited,
    errored,
    registered,
  };
}

function runBridge(email, timeout) {
  return new Promise((resolve, reject) => {
    const proc = spawn(VENV_PYTHON, [BRIDGE, email, String(timeout)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (e) =>
      reject(new Error(`Failed to launch holehe bridge (${VENV_PYTHON}): ${e.message}`))
    );
    proc.on('close', (code) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`holehe bridge bad output (code ${code}): ${stderr.slice(-300)}`));
      }
    });
  });
}

module.exports = { lookup };
