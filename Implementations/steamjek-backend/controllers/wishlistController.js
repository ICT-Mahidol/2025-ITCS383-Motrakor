const pool = require('../db');

// GET WISHLIST
const getWishlist = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT wishlist.id, games.id as game_id, games.title, 
              games.price, games.cover_image, games.genre
       FROM wishlist
       JOIN games ON wishlist.game_id = games.id
       WHERE wishlist.user_id = $1
       ORDER BY wishlist.added_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD TO WISHLIST
const addToWishlist = async (req, res) => {
  const user_id = req.user.id;
  const { game_id } = req.body;
  try {
    // Check if game exists
    const game = await pool.query(
      'SELECT * FROM games WHERE id = $1', [game_id]
    );
    if (game.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND game_id = $2',
      [user_id, game_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Game already in wishlist' });
    }

    await pool.query(
      'INSERT INTO wishlist (user_id, game_id) VALUES ($1, $2)',
      [user_id, game_id]
    );
    res.status(201).json({ message: 'Game added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
  const user_id = req.user.id;
  const { gameId } = req.params;
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND game_id = $2',
      [user_id, gameId]
    );
    res.json({ message: 'Game removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };