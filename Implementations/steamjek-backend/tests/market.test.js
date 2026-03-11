const request = require('supertest');
const app = require('../server');
const pool = require('../db');

let token;
let token2;
let itemTypeId;
let listingId;

beforeAll(async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = login.body.token;

  // Register and login second user
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      address: '456 Test Street'
    });
  const login2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test2@example.com', password: 'password123' });
  token2 = login2.body.token;

  // Create item type and give to user
  const games = await pool.query(
    'SELECT id FROM games LIMIT 1'
  );
  const user = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['test@example.com']
  );
  const itemType = await pool.query(
    `INSERT INTO item_types (name, description, game_id, rarity)
     VALUES ('Test Sword', 'A test sword', $1, 'rare') RETURNING id`,
    [games.rows[0].id]
  );
  itemTypeId = itemType.rows[0].id;

  await pool.query(
    `INSERT INTO user_items (owner_id, item_type_id, quantity)
     VALUES ($1, $2, 3)`,
    [user.rows[0].id, itemTypeId]
  );
});

describe('Marketplace API', () => {

  describe('GET /api/market/listings', () => {
    it('should get all listings', async () => {
      const res = await request(app).get('/api/market/listings');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/market/my-items', () => {
    it('should get user inventory', async () => {
      const res = await request(app)
        .get('/api/market/my-items')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/market/listings', () => {
    it('should list item for sale', async () => {
      const res = await request(app)
        .post('/api/market/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({ item_type_id: itemTypeId, quantity: 1, price: 4.99 });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Item listed successfully');
      listingId = res.body.listing.id;
    });

    it('should fail listing more than owned', async () => {
      const res = await request(app)
        .post('/api/market/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({ item_type_id: itemTypeId, quantity: 999, price: 4.99 });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/market/buy/:listingId', () => {
    it('should fail buying own item', async () => {
      const res = await request(app)
        .post(`/api/market/buy/${listingId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('You cannot buy your own item');
    });

    it('should buy item successfully as different user', async () => {
      const res = await request(app)
        .post(`/api/market/buy/${listingId}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Item purchased successfully');
    });

    it('should fail buying already sold item', async () => {
      const res = await request(app)
        .post(`/api/market/buy/${listingId}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toBe(404);
    });
  });
});