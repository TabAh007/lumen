// Discovery service — wraps the Maigret CLI (installed in ../maigret-venv) to
// find which platforms a handle exists on. Spawns with an argument array (no
// shell) so the handle can't inject commands. Reads Maigret's JSON report and
// normalizes it to a stable shape for the API.

const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const MAIGRET_BIN =
  process.env.MAIGRET_BIN || path.join(PROJECT_ROOT, 'maigret-venv', 'bin', 'maigret');

// Only allow plausible handle characters — defense in depth on top of spawn().
const HANDLE_RE = /^[A-Za-z0-9._-]{1,64}$/;

// Aggregator/clone sites that are noise for our purposes.
const NOISE_SITES = new Set(['Picuki', 'tikbuddy.com', 'Bit.ly']);

async function discover(handle, { topSites = 100, timeout = 10 } = {}) {
  if (!HANDLE_RE.test(handle)) {
    const err = new Error('Invalid handle format');
    err.status = 400;
    throw err;
  }

  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'maigret-'));
  try {
    await runMaigret(handle, outDir, topSites, timeout);
    const reportPath = path.join(outDir, `report_${handle}_simple.json`);
    const raw = JSON.parse(await fs.readFile(reportPath, 'utf8'));
    return normalize(handle, raw);
  } finally {
    fs.rm(outDir, { recursive: true, force: true }).catch(() => {});
  }
}

function runMaigret(handle, outDir, topSites, timeout) {
  return new Promise((resolve, reject) => {
    const args = [
      handle,
      '--json', 'simple',
      '--top-sites', String(topSites),
      '--timeout', String(timeout),
      '--no-progressbar',
      '--no-color',
      '--folderoutput', outDir,
    ];
    const proc = spawn(MAIGRET_BIN, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (e) =>
      reject(new Error(`Failed to launch maigret (${MAIGRET_BIN}): ${e.message}`))
    );
    proc.on('close', (code) => {
      // Maigret exits 0 even when nothing is found; non-zero is a real failure.
      if (code === 0) resolve();
      else reject(new Error(`maigret exited with code ${code}: ${stderr.slice(-400)}`));
    });
  });
}

function normalize(handle, raw) {
  const sites = [];
  const tagCounts = {};

  for (const [name, entry] of Object.entries(raw)) {
    if (NOISE_SITES.has(name)) continue;
    const status = entry.status || {};
    if (status.status !== 'Claimed') continue;

    const ids = status.ids || {};
    const tags = (entry.site && entry.site.tags) || [];
    tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1));

    sites.push({
      platform: name,
      url: entry.url_user || status.url || null,
      isSimilar: Boolean(entry.is_similar),
      rank: entry.rank ?? null,
      extracted: {
        fullname: ids.fullname || null,
        bio: ids.description || null,
        image: ids.image || null,
      },
      tags,
    });
  }

  // Sort: exact matches first, then by site rank (lower = more popular).
  sites.sort((a, b) => {
    if (a.isSimilar !== b.isSimilar) return a.isSimilar ? 1 : -1;
    return (a.rank ?? 1e9) - (b.rank ?? 1e9);
  });

  const interests = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return { handle, count: sites.length, sites, interests };
}

module.exports = { discover };
