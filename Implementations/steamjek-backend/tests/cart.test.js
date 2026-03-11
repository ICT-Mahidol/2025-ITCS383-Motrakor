const request = require('supertest');
const app = require('../server');
const pool = require('../db');

let token;
let gameId;

beforeAll(async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = login.body.token;

  const games = await pool.query(
    'SELECT id FROM games WHERE is_approved = true LIMIT 1'
  );
  gameId = games.rows[0].id;

  // Clear cart first to avoid conflicts
  await pool.query(
    `DELETE FROM cart WHERE user_id = (
      SELECT id FROM users WHERE email = 'test@example.com'
    )`
  );
});

describe('Cart API', () => {

  describe('POST /api/cart', () => {
    it('should add game to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ game_id: gameId });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Game added to cart');
    });

    it('should fail adding duplicate game', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ game_id: gameId });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Game already in cart');
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ game_id: gameId });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/cart', () => {
    it('should get cart items', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/cart/:gameId', () => {
    it('should remove game from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Game removed from cart');
    });
  });
});