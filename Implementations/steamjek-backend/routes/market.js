const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getListings,
  createListing,
  buyItem,
  getMyItems,
  getMyListings
} = require('../controllers/marketController');

router.get('/listings', getListings);
router.get('/my-items', authenticateToken, getMyItems);
router.get('/my-listings', authenticateToken, getMyListings);
router.post('/listings', authenticateToken, createListing);
router.post('/buy/:listingId', authenticateToken, buyItem);

module.exports = router;