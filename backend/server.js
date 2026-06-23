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
  // Bind to 0.0.0.0 so cloud hosts (Render, etc.) can reach the port.
  app.listen(PORT, '0.0.0.0', () => console.log(`[server] running on port ${PORT}`));
})();
