const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createList,
  updateList
} = require('../controllers/listController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Mounted at /api/boards/:id/lists
router.post('/', requireRole(['owner', 'admin']), createList);

// Mounted at /api/lists
router.patch('/:id', requireRole(['owner', 'admin']), updateList);

// Nested routes
router.use('/:id/tasks', require('./taskRoutes'));

module.exports = router;
