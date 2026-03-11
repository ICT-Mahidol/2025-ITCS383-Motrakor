const pool = require('../db');

// Clean up test data before each test suite
beforeAll(async () => {
  await pool.query('DELETE FROM market_transactions');
  await pool.query('DELETE FROM market_listings');
  await pool.query('DELETE FROM user_items');
  await pool.query('DELETE FROM item_types');
  await pool.query('DELETE FROM ratings');
  await pool.query('DELETE FROM wishlist');
  await pool.query('DELETE FROM cart');
  await pool.query('DELETE FROM purchases');
  await pool.query('DELETE FROM games');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});