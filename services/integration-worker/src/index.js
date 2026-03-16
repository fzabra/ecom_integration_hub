require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const subscriber = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

const app = express();
app.use(cors());
app.use(express.json());

const processedEvents = [];

function pushLog(log) {
  processedEvents.unshift({ ...log, timestamp: new Date().toISOString() });
  if (processedEvents.length > 50) {
    processedEvents.pop();
  }
}

async function handleOrderCreated(event) {
  const order = event.data?.order;
  if (!order) return;

  pushLog({
    type: 'erp.sync',
    provider: process.env.ERP_PROVIDER || 'tiny-mock',
    detail: `Pedido ${order.id} sincronizado para faturamento e estoque`
  });

  pushLog({
    type: 'pim.refresh',
    provider: process.env.PIM_PROVIDER || 'akeneo-mock',
    detail: `Catalogo marcado para refresh apos pedido ${order.id}`
  });

  pushLog({
    type: 'ai.recommendation',
    provider: process.env.AI_PROVIDER || 'local-embeddings-mock',
    detail: `Embedding/recomendacao recalculada para pedido ${order.id}`
  });

  pushLog({
    type: 'analytics.event',
    provider: process.env.ANALYTICS_PROVIDER || 'ga4-mock',
    detail: `Evento purchase enviado com valor ${order.total_cents}`
  });

  console.log(`[worker] processed order.created ${order.id}`);
}

subscriber.subscribe('orders.created', (err) => {
  if (err) {
    console.error('[worker] subscribe error', err);
    process.exit(1);
  }
  console.log('[worker] subscribed to orders.created');
});

subscriber.on('message', async (channel, message) => {
  if (channel !== 'orders.created') return;

  try {
    const event = JSON.parse(message);
    if (event.type === 'order.created') {
      await handleOrderCreated(event);
    }
  } catch (error) {
    console.error('[worker] failed to handle message', error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ worker: 'ok', timestamp: new Date().toISOString() });
});

app.get('/events', (_req, res) => {
  res.json({ items: processedEvents });
});

app.post('/webhooks/mock', (req, res) => {
  pushLog({
    type: 'webhook.received',
    provider: 'api-webhook',
    detail: `Recebido ${req.body?.type || 'unknown'}`
  });

  res.status(202).json({ ok: true });
});

const port = Number(process.env.PORT || 3003);
app.listen(port, () => {
  console.log(`[worker] http server on ${port}`);
});
