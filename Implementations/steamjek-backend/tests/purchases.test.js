const request = require('supertest');
const app = require('../server');
const pool = require('../db');

let token;
let gameId;
let paymentIntentId;

beforeAll(async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = login.body.token;

  const games = await pool.query(
    'SELECT id FROM games WHERE is_approved = true LIMIT 1'
  );
  gameId = games.rows[0].id;

  // Clear existing cart and purchases to start fresh
  const user = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['test@example.com']
  );
  const userId = user.rows[0].id;

  await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM purchases WHERE user_id = $1', [userId]);

  // Add game to cart fresh
  await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ game_id: gameId });
});

describe('Purchases API', () => {

  describe('POST /api/purchases/create-payment-intent', () => {
    it('should create a payment intent', async () => {
      const res = await request(app)
        .post('/api/purchases/create-payment-intent')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('clientSecret');
      expect(res.body).toHaveProperty('amount');
      paymentIntentId = res.body.clientSecret.split('_secret_')[0];
    });

    it('should fail with empty cart', async () => {
      // Clear cart
      const user = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        ['test@example.com']
      );
      await pool.query(
        'DELETE FROM cart WHERE user_id = $1',
        [user.rows[0].id]
      );

      const res = await request(app)
        .post('/api/purchases/create-payment-intent')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });
  });

  describe('GET /api/purchases', () => {
    it('should get purchase history', async () => {
      const res = await request(app)
        .get('/api/purchases')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
