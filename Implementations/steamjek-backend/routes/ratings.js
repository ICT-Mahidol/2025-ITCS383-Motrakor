const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getGameRatings,
  rateGame
} = require('../controllers/ratingsController');

router.get('/:gameId', getGameRatings);
router.post('/:gameId', authenticateToken, rateGame);

module.exports = router;