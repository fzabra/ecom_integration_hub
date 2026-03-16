require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const { pool, initDb } = require('./db');
const { sendWebhooks, mockSaaSCharge } = require('./integrations');

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3
});

app.get('/health', async (_req, res) => {
  const db = await pool.query('SELECT 1 as ok');
  res.json({
    api: 'ok',
    db: db.rows[0].ok === 1 ? 'ok' : 'error',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  res.json(rows);
});

app.get('/api/cart', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT c.product_id, c.quantity, p.name, p.price_cents, p.image_url
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    ORDER BY c.id;
  `);

  const total_cents = rows.reduce((total, row) => total + row.quantity * row.price_cents, 0);
  res.json({ items: rows, total_cents });
});

app.post('/api/cart/items', async (req, res) => {
  const { productId, quantity } = req.body || {};

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'productId e quantity sao obrigatorios' });
  }

  await pool.query(
    `INSERT INTO cart_items (product_id, quantity)
     VALUES ($1, $2)
     ON CONFLICT (product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [productId, quantity]
  );

  return res.status(201).json({ ok: true });
});

app.delete('/api/cart/items/:productId', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE product_id = $1', [req.params.productId]);
  res.json({ ok: true });
});

app.post('/api/checkout', async (req, res) => {
  const customerEmail = req.body?.email;
  if (!customerEmail) {
    return res.status(400).json({ error: 'email obrigatorio' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(`
      SELECT c.product_id, c.quantity, p.price_cents, p.stock
      FROM cart_items c
      JOIN products p ON p.id = c.product_id
      ORDER BY c.id;
    `);

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'carrinho vazio' });
    }

    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `estoque insuficiente para produto ${item.product_id}` });
      }
    }

    const totalCents = cartResult.rows.reduce((sum, item) => sum + item.quantity * item.price_cents, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (customer_email, total_cents, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [customerEmail, totalCents, 'paid']
    );

    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price_cents]
      );

      await client.query('UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2', [
        item.quantity,
        item.product_id
      ]);
    }

    await client.query('DELETE FROM cart_items');
    await client.query('COMMIT');

    const charge = mockSaaSCharge(order);
    const event = {
      type: 'order.created',
      created_at: new Date().toISOString(),
      data: {
        order,
        charge
      }
    };

    await redis.publish('orders.created', JSON.stringify(event));
    await sendWebhooks(event);

    return res.status(201).json({ order, charge });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: 'erro ao processar checkout' });
  } finally {
    client.release();
  }
});

app.get('/api/orders', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY id DESC');
  res.json(rows);
});

async function start() {
  await initDb();

  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`[api] running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('[api] failed to start', error);
  process.exit(1);
});
