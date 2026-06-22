const express = require('express');
const router = express.Router();

const maigret = require('../services/maigret');
const apify = require('../services/apify');
const analysis = require('../services/analysis');

// Step 1: discover where a handle exists online
router.post('/discover', async (req, res, next) => {
  try {
    const { handle } = req.body;
    if (!handle) return res.status(400).json({ error: 'handle is required' });
    res.json(await maigret.discover(handle.trim()));
  } catch (err) {
    next(err);
  }
});

// Step 2: collect public content from one platform
router.post('/collect', async (req, res, next) => {
  try {
    const { platform, handle } = req.body;
    if (!platform || !handle) {
      return res.status(400).json({ error: 'platform and handle are required' });
    }
    res.json(await apify.collect(platform, handle.trim()));
  } catch (err) {
    next(err);
  }
});

// Step 3: analyze collected content for interests + stances
router.post('/analyze', async (req, res, next) => {
  try {
    const { handle, posts } = req.body;
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: 'posts (array) is required' });
    }
    res.json(await analysis.analyze({ handle, posts }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
