// Content collection service — pulls public posts/bio from Instagram and TikTok
// via Apify actors, normalized to one shape:
//   { platform, handle, profile: {...}, posts: [{ id, text, url, timestamp, likes, hashtags }] }

const { ApifyClient } = require('apify-client');

const ACTORS = {
  instagram: process.env.APIFY_IG_ACTOR || 'apify/instagram-profile-scraper',
  tiktok: process.env.APIFY_TT_ACTOR || 'clockworks/free-tiktok-scraper',
};

let _client;
function client() {
  if (!_client) {
    if (!process.env.APIFY_TOKEN) throw new Error('APIFY_TOKEN is not set');
    _client = new ApifyClient({ token: process.env.APIFY_TOKEN });
  }
  return _client;
}

function normPlatform(platform) {
  const p = String(platform || '').toLowerCase();
  if (p.includes('insta')) return 'instagram';
  if (p.includes('tiktok') || p.includes('tik tok')) return 'tiktok';
  return null;
}

async function collect(platform, handle, { limit = 12 } = {}) {
  const key = normPlatform(platform);
  if (!key) {
    const err = new Error(`Unsupported platform for collection: ${platform}`);
    err.status = 400;
    throw err;
  }
  const c = client();

  if (key === 'instagram') {
    const run = await c.actor(ACTORS.instagram).call({ usernames: [handle] });
    const { items } = await c.dataset(run.defaultDatasetId).listItems();
    return normalizeInstagram(handle, items[0]);
  }

  // tiktok
  const run = await c.actor(ACTORS.tiktok).call({
    profiles: [handle],
    resultsPerPage: limit,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
  });
  const { items } = await c.dataset(run.defaultDatasetId).listItems();
  return normalizeTikTok(handle, items);
}

function normalizeInstagram(handle, p) {
  if (!p) return emptyResult('instagram', handle);
  const posts = (p.latestPosts || []).map((x) => ({
    id: x.id || x.shortCode,
    text: x.caption || '',
    url: x.url || null,
    timestamp: x.timestamp || null,
    likes: x.likesCount ?? null,
    comments: x.commentsCount ?? null,
    hashtags: x.hashtags || [],
  }));
  return {
    platform: 'instagram',
    handle,
    profile: {
      username: p.username || handle,
      displayName: p.fullName || null,
      bio: p.biography || '',
      followers: p.followersCount ?? null,
      verified: Boolean(p.verified),
      private: Boolean(p.private),
      image: p.profilePicUrlHD || p.profilePicUrl || null,
      url: p.url || `https://www.instagram.com/${handle}/`,
    },
    posts,
  };
}

function normalizeTikTok(handle, items) {
  if (!items || !items.length) return emptyResult('tiktok', handle);
  const author = items[0].authorMeta || {};
  const posts = items.map((x) => ({
    id: x.id,
    text: x.text || '',
    url: x.webVideoUrl || null,
    timestamp: x.createTimeISO || null,
    likes: x.diggCount ?? null,
    comments: x.commentCount ?? null,
    views: x.playCount ?? null,
    hashtags: (x.hashtags || []).map((h) => (typeof h === 'string' ? h : h.name)),
  }));
  return {
    platform: 'tiktok',
    handle,
    profile: {
      username: author.name || handle,
      displayName: author.nickName || null,
      bio: author.signature || '',
      followers: author.fans ?? null,
      verified: Boolean(author.verified),
      private: Boolean(author.privateAccount),
      image: author.avatar || null,
      url: author.profileUrl || `https://www.tiktok.com/@${handle}`,
    },
    posts,
  };
}

function emptyResult(platform, handle) {
  return {
    platform,
    handle,
    empty: true,
    note: 'No public content returned (account may be private, empty, or not found).',
    profile: null,
    posts: [],
  };
}

module.exports = { collect };
