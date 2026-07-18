const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createList,
  updateList
} = require('../controllers/listController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Mounted at /api/boards/:id/lists
router.post('/', requireRole(['admin', 'member']), createList);

// Mounted at /api/lists
router.patch('/:id', requireRole(['admin', 'member']), updateList);

// Nested routes
router.use('/:id/tasks', require('./taskRoutes'));

module.exports = router;
