import axios from 'axios';

// Requests are proxied to the backend (see vite.config.js).
const api = axios.create({ baseURL: '/api', timeout: 180000 });

export const discover = (handle) => api.post('/discover', { handle }).then((r) => r.data);
export const collect = (platform, handle) =>
  api.post('/collect', { platform, handle }).then((r) => r.data);
export const analyze = (handle, profile, posts) =>
  api.post('/analyze', { handle, profile, posts }).then((r) => r.data);
export const emailLookup = (email) =>
  api.post('/email-lookup', { email }).then((r) => r.data);
export const socialAnalyze = (username) =>
  api.post('/social-analyze', { username }).then((r) => r.data);
