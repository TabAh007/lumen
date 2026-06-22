// Discovery service — wraps Maigret (Python) to find which platforms a handle
// exists on. Phase 1 will shell out to the maigret CLI and parse its JSON.
// For now this returns a stubbed shape so the API contract is stable.

async function discover(handle) {
  // TODO (Phase 1): spawn maigret --json simple <handle> and parse results.
  return {
    handle,
    stub: true,
    sites: [
      { platform: 'Instagram', url: `https://instagram.com/${handle}`, found: true },
      { platform: 'TikTok', url: `https://tiktok.com/@${handle}`, found: true },
      { platform: 'LinkedIn', url: null, found: false },
    ],
  };
}

module.exports = { discover };
