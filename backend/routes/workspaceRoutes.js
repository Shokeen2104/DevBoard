const express = require('express');
const router = express.Router();
const {
  createWorkspace,
  getWorkspace,
  addMember,
  changeMemberRole
} = require('../controllers/workspaceController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Apply requireAuth to all workspace routes
router.use(requireAuth);

router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.post('/:id/members', requireRole(['admin']), addMember);
router.patch('/:id/members/:userId', requireRole(['admin']), changeMemberRole);

// Nested routes
router.use('/:id/boards', require('./boardRoutes'));

module.exports = router;
