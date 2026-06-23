import axios from 'axios';

// In production, set VITE_API_URL to the backend's base URL (e.g.
// https://lumen-backend.onrender.com). Locally it's unset, so requests go to
// "/api" and Vite proxies them to the backend (see vite.config.js).
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL: API_BASE, timeout: 180000 });

export const discover = (handle) => api.post('/discover', { handle }).then((r) => r.data);
export const collect = (platform, handle) =>
  api.post('/collect', { platform, handle }).then((r) => r.data);
export const analyze = (handle, profile, posts) =>
  api.post('/analyze', { handle, profile, posts }).then((r) => r.data);
export const emailLookup = (email) =>
  api.post('/email-lookup', { email }).then((r) => r.data);
export const socialAnalyze = (username) =>
  api.post('/social-analyze', { username }).then((r) => r.data);
