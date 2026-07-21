const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTask,
  updateTask,
  deleteTask,
  getTaskActivity
} = require('../controllers/taskController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Mounted at /api/lists/:id/tasks
router.post('/', requireRole(['owner', 'admin', 'member']), createTask);

// Mounted at /api/tasks
router.patch('/:id', requireRole(['owner', 'admin', 'member']), updateTask);
router.delete('/:id', requireRole(['owner', 'admin', 'member']), deleteTask);
router.get('/:id/activity', getTaskActivity);

module.exports = router;
