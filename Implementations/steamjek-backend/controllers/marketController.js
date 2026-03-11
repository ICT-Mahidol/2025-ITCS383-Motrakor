const pool = require('../db');

// GET ALL ACTIVE LISTINGS
const getListings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ml.id, it.name, it.description, it.image_url, 
              ml.price, u.name as seller_name, g.title as game_title,
              ml.listed_at
       FROM market_listings ml
       JOIN items it ON ml.item_id = it.id
       JOIN users u ON ml.seller_id = u.id
       JOIN games g ON it.game_id = g.id
       WHERE ml.is_sold = false
       ORDER BY ml.listed_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY ITEMS (inventory that ARE NOT listed)
const getMyItems = async (req, res) => {
  const owner_id = req.user.id;
  try {
    // Get items owned by user that are not currently active in a listing
    const result = await pool.query(
      `SELECT it.id, it.name, it.description, it.image_url, g.title as game_title
       FROM items it
       JOIN games g ON it.game_id = g.id
       WHERE it.owner_id = $1 
       AND it.id NOT IN (SELECT item_id FROM market_listings WHERE is_sold = false)`,
      [owner_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY ACTIVE LISTINGS
const getMyListings = async (req, res) => {
  const seller_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT ml.*, it.name as item_name, it.image_url
       FROM market_listings ml
       JOIN items it ON ml.item_id = it.id
       WHERE ml.seller_id = $1 AND ml.is_sold = false
       ORDER BY ml.listed_at DESC`,
      [seller_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE LISTING (sell an item)
const createListing = async (req, res) => {
  const seller_id = req.user.id;
  const { item_id, price } = req.body;
  try {
    // Check if user owns this item
    const item = await pool.query(
      'SELECT * FROM items WHERE id = $1 AND owner_id = $2',
      [item_id, seller_id]
    );
    if (item.rows.length === 0) {
      return res.status(403).json({
        message: 'You do not own this item'
      });
    }

    // Check if it's already listed
    const existingListing = await pool.query(
      'SELECT * FROM market_listings WHERE item_id = $1 AND is_sold = false',
      [item_id]
    );
    if (existingListing.rows.length > 0) {
      return res.status(400).json({
        message: 'Item is already listed'
      });
    }

    // Create listing
    const listing = await pool.query(
      `INSERT INTO market_listings (item_id, seller_id, price)
       VALUES ($1, $2, $3) RETURNING *`,
      [item_id, seller_id, price]
    );
    res.status(201).json({
      message: 'Item listed successfully',
      listing: listing.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// BUY ITEM
const buyItem = async (req, res) => {
  const buyer_id = req.user.id;
  const { listingId } = req.params;
  try {
    // Get listing
    const listing = await pool.query(
      'SELECT * FROM market_listings WHERE id = $1 AND is_sold = false',
      [listingId]
    );
    if (listing.rows.length === 0) {
      return res.status(404).json({
        message: 'Listing not found or already sold'
      });
    }

    const { item_id, seller_id, price } = listing.rows[0];

    // Prevent buying your own item
    if (seller_id === buyer_id) {
      return res.status(400).json({
        message: 'You cannot buy your own item'
      });
    }

    // Update item owner
    await pool.query(
      'UPDATE items SET owner_id = $1 WHERE id = $2',
      [buyer_id, item_id]
    );

    // Mark listing as sold
    await pool.query(
      'UPDATE market_listings SET is_sold = true WHERE id = $1',
      [listingId]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO market_transactions 
        (listing_id, buyer_id, seller_id, item_id, price)
       VALUES ($1, $2, $3, $4, $5)`,
      [listingId, buyer_id, seller_id, item_id, price]
    );

    res.json({
      message: 'Item purchased successfully',
      item_id,
      price
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getListings,
  createListing,
  buyItem,
  getMyItems,
  getMyListings
};