const request = require('supertest');
const app = require('../server');
const pool = require('../db');

let token;
let gameId;

beforeAll(async () => {
    // Login to get token
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
    token = res.body.token;
});

describe('Games API', () => {

    describe('POST /api/games', () => {
        it('should create a game successfully', async () => {
            const res = await request(app)
                .post('/api/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Game',
                    description: 'A test game',
                    genre: 'action',
                    price: 9.99,
                    age_rating: 'all ages',
                    system_requirements: 'Windows 10, 8GB RAM'
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.game.title).toBe('Test Game');
            gameId = res.body.game.id;
        });

        it('should fail without auth token', async () => {
            const res = await request(app)
                .post('/api/games')
                .send({ title: 'No Auth Game', price: 9.99 });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/games', () => {
        it('should return approved games', async () => {
            const res = await request(app).get('/api/games');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return games after approval', async () => {
            await pool.query(
                'UPDATE games SET is_approved = true WHERE id = $1',
                [gameId]
            );
            const res = await request(app).get('/api/games');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/games/:id', () => {
        it('should return a single game', async () => {
            const res = await request(app).get(`/api/games/${gameId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Test Game');
        });

        it('should return 404 for non-existent game', async () => {
            const res = await request(app).get('/api/games/99999');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/games/search', () => {
        it('should search games by title', async () => {
            const res = await request(app)
                .get('/api/games/search?query=Test');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should filter games by genre', async () => {
            const res = await request(app)
                .get('/api/games/search?genre=action');
            expect(res.statusCode).toBe(200);
        });

        it('should return empty for non-existent game', async () => {
            const res = await request(app)
                .get('/api/games/search?query=zzznomatch');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });
    });
});