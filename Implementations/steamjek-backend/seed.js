const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Cleaning up existing data...');
    await pool.query('TRUNCATE users, games, items, cart, wishlist, purchases, market_listings, market_transactions, ratings RESTART IDENTITY CASCADE');

    console.log('Seeding users...');
    const hashedPw = await bcrypt.hash('password123', 10);
    const userRes = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Test User', 'test@example.com', hashedPw, '123 Test St', 'user']
    );
    const userId = userRes.rows[0].id;

    console.log('Seeding games...');
    const games = [
      ['NebulaSiege', 'A space strategy game.', 'Strategy', 29.99, '🌌', 'Teen'],
      ['ShadowRift', 'Dark adventure in the void.', 'Adventure', 19.99, '🌑', 'Mature'],
      ['EcoTycoon', 'Build a green empire.', 'Simulation', 24.99, '🌿', 'Everyone'],
      ['BulletZone', 'Fast paced shooter.', 'Action', 14.99, '💥', 'Mature'],
      ['CyberRun', 'Neon future parkour.', 'Action', 9.99, '🏃', 'Everyone']
    ];

    const gameIds = [];
    for (const g of games) {
      const gRes = await pool.query(
        'INSERT INTO games (title, description, genre, price, cover_image, age_rating, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [...g, true]
      );
      gameIds.push(gRes.rows[0].id);
    }

    console.log('Seeding items & listings...');
    const itemNames = ['Void Blade', 'Energy Shield', 'Mana Potion', 'Stealth Cloak'];
    for (let i = 0; i < itemNames.length; i++) {
      const itemRes = await pool.query(
        'INSERT INTO items (name, description, owner_id, game_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [itemNames[i], `A rare ${itemNames[i]}`, userId, gameIds[0]]
      );
      const itemId = itemRes.rows[0].id;

      await pool.query(
        'INSERT INTO market_listings (item_id, seller_id, price) VALUES ($1, $2, $3)',
        [itemId, userId, (i + 1) * 5.50]
      );
    }

    console.log('Seeding wishlist & purchases...');
    await pool.query('INSERT INTO wishlist (user_id, game_id) VALUES ($1, $2)', [userId, gameIds[2]]);
    await pool.query('INSERT INTO wishlist (user_id, game_id) VALUES ($1, $2)', [userId, gameIds[3]]);
    
    await pool.query('INSERT INTO purchases (user_id, game_id, amount) VALUES ($1, $2, $3)', [userId, gameIds[0], 29.99]);
    await pool.query('INSERT INTO purchases (user_id, game_id, amount) VALUES ($1, $2, $3)', [userId, gameIds[1], 19.99]);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
