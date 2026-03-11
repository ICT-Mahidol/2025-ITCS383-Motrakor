const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  getAllUsers,
  deleteUser,
  getPendingGames,
  approveGame,
  rejectGame,
  getAllPurchases
} = require('../controllers/adminController');

// All admin routes need both middlewares
router.use(authenticateToken, isAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/games/pending', getPendingGames);
router.put('/games/:id/approve', approveGame);
router.delete('/games/:id/reject', rejectGame);
router.get('/purchases', getAllPurchases);

module.exports = router;