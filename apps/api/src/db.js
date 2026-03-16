const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://app:app@localhost:5432/ecommerce'
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      UNIQUE(product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_email TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    await pool.query(`
      INSERT INTO products (sku, name, description, price_cents, image_url, stock, category)
      VALUES
      ('SKU-HEADSET-001', 'Headset Pro X', 'Headset com cancelamento de ruído para setup gamer.', 69900, 'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=1200&auto=format&fit=crop', 32, 'audio'),
      ('SKU-MOUSE-002', 'Mouse Ultra Light', 'Mouse ergonômico com sensor de alta precisão.', 24900, 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200&auto=format&fit=crop', 80, 'perifericos'),
      ('SKU-KEYBOARD-003', 'Keyboard TKL RGB', 'Teclado mecânico TKL com switches táteis.', 39900, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1200&auto=format&fit=crop', 54, 'perifericos');
    `);
  }
}

module.exports = {
  pool,
  initDb
};
