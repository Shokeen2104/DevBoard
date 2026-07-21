const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  findUser
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/find', requireAuth, findUser);

module.exports = router;
