require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const pipelineRoutes = require('./routes/pipeline');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'osint-backend', time: new Date().toISOString() });
});

app.use('/api', pipelineRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`[server] running on http://localhost:${PORT}`));
})();
