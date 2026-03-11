const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getCart,
  addToCart,
  removeFromCart
} = require('../controllers/cartController');

router.get('/', authenticateToken, getCart);
router.post('/', authenticateToken, addToCart);
router.delete('/:gameId', authenticateToken, removeFromCart);

module.exports = router;