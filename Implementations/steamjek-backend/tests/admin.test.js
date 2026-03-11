const request = require('supertest');
const app = require('../server');
const pool = require('../db');

let adminToken;
let userToken;
let gameId;

beforeAll(async () => {
  // Set user 1 as admin
  await pool.query(
    'UPDATE users SET role = $1 WHERE email = $2',
    ['admin', 'test@example.com']
  );

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test2@example.com', password: 'password123' });
  userToken = userLogin.body.token;

  const games = await pool.query('SELECT id FROM games LIMIT 1');
  gameId = games.rows[0].id;
});

describe('Admin API', () => {

  describe('GET /api/admin/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Access denied. Admins only.');
    });
  });

  describe('GET /api/admin/games/pending', () => {
    it('should get pending games', async () => {
      const res = await request(app)
        .get('/api/admin/games/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/admin/games/:id/approve', () => {
    it('should approve a game', async () => {
      const res = await request(app)
        .put(`/api/admin/games/${gameId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Game approved successfully');
    });
  });

  describe('GET /api/admin/purchases', () => {
    it('should get all purchases', async () => {
      const res = await request(app)
        .get('/api/admin/purchases')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});