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
});

describe('Wishlist API', () => {

  describe('POST /api/wishlist', () => {
    it('should add game to wishlist', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ game_id: gameId });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Game added to wishlist');
    });

    it('should fail adding duplicate', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ game_id: gameId });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Game already in wishlist');
    });
  });

  describe('GET /api/wishlist', () => {
    it('should get wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/wishlist/:gameId', () => {
    it('should remove game from wishlist', async () => {
      const res = await request(app)
        .delete(`/api/wishlist/${gameId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Game removed from wishlist');
    });
  });
});