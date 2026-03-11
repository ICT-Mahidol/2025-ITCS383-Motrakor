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

  // Get user id
  const user = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['test@example.com']
  );
  const userId = user.rows[0].id;

  // Clear existing rating and ensure purchase exists
  await pool.query(
    'DELETE FROM ratings WHERE user_id = $1 AND game_id = $2',
    [userId, gameId]
  );

  await pool.query(
    `INSERT INTO purchases (user_id, game_id, amount) 
     VALUES ($1, $2, $3) 
     ON CONFLICT DO NOTHING`,
    [userId, gameId, 9.99]
  );
});

describe('Ratings API', () => {

  describe('POST /api/ratings/:gameId', () => {
    it('should rate a game successfully', async () => {
      const res = await request(app)
        .post(`/api/ratings/${gameId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, review: 'Amazing game!' });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Game rated successfully');
    });

    it('should update existing rating', async () => {
      const res = await request(app)
        .post(`/api/ratings/${gameId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4, review: 'Updated review' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Rating updated successfully');
    });
  });

  describe('GET /api/ratings/:gameId', () => {
    it('should get game ratings', async () => {
      const res = await request(app)
        .get(`/api/ratings/${gameId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('average_rating');
      expect(res.body).toHaveProperty('total_reviews');
      expect(res.body).toHaveProperty('reviews');
    });
  });
});