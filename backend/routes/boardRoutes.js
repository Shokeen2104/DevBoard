const express = require('express');
const router = express.Router({ mergeParams: true }); // to access workspaceId if mounted under workspaces
const {
  createBoard,
  getBoard,
  deleteBoard
} = require('../controllers/boardController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

// If mounted at /api/workspaces/:id/boards
router.post('/', requireRole(['admin', 'member']), createBoard);

// If mounted at /api/boards
router.get('/:id', getBoard);
router.delete('/:id', requireRole(['admin']), deleteBoard);

// Nested routes
router.use('/:id/lists', require('./listRoutes'));

module.exports = router;
