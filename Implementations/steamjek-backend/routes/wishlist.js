const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');

router.get('/', authenticateToken, getWishlist);
router.post('/', authenticateToken, addToWishlist);
router.delete('/:gameId', authenticateToken, removeFromWishlist);

module.exports = router;