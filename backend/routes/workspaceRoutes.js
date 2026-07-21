const express = require('express');
const router = express.Router();
const {
  createWorkspace,
  getWorkspace,
  getUserWorkspaces,
  addMember,
  changeMemberRole,
  removeMember,
  deleteWorkspace
} = require('../controllers/workspaceController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Apply requireAuth to all workspace routes
router.use(requireAuth);

router.get('/', getUserWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.delete('/:id', requireRole(['owner']), deleteWorkspace);
router.post('/:id/members', requireRole(['owner', 'admin']), addMember);
router.patch('/:id/members/:userId', requireRole(['owner', 'admin']), changeMemberRole);
router.delete('/:id/members/:userId', requireRole(['owner', 'admin']), removeMember);

// Nested routes
router.use('/:id/boards', require('./boardRoutes'));

module.exports = router;
