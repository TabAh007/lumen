// Content collection service — pulls public posts/bio/captions from Instagram
// and TikTok via Apify actors. Phase 2 wires the real ApifyClient calls.
// Returns a normalized shape regardless of platform.

async function collect(platform, handle) {
  // TODO (Phase 2): call the appropriate Apify actor and normalize the output.
  return {
    platform,
    handle,
    stub: true,
    profile: { displayName: handle, bio: '', followers: null },
    posts: [
      // { id, text, url, timestamp, likes }
    ],
  };
}

module.exports = { collect };
