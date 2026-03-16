require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const publicDir = path.join(__dirname, 'public');
const apiBaseUrl = process.env.API_URL || 'http://localhost:3001';
const workerBaseUrl = process.env.WORKER_URL || 'http://localhost:3003';

app.use(express.static(publicDir));
app.use(express.json());

app.use('/proxy/api', async (req, res) => {
  try {
    const upstreamPath = req.originalUrl.replace('/proxy/api', '/api');
    const response = await fetch(`${apiBaseUrl}${upstreamPath}`, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body || {})
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (_error) {
    res.status(502).json({ error: 'proxy api indisponivel' });
  }
});

app.get('/proxy/worker/events', async (_req, res) => {
  try {
    const response = await fetch(`${workerBaseUrl}/events`);
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (_error) {
    res.status(502).json({ items: [] });
  }
});

app.get('/env.js', (_req, res) => {
  const apiUrl = process.env.PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  res.type('application/javascript').send(`window.__CONFIG__ = { API_URL: '${apiUrl}' };`);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`[web] running at http://localhost:${port}`);
});
