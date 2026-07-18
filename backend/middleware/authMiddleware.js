const jwt = require('jsonwebtoken');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

// Middleware to verify JWT access token
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId, iat, exp }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check roles in a workspace
// Requires req.params.id (workspaceId) OR needs to resolve workspaceId from boardId/listId/taskId
exports.requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });

      let workspaceId = req.params.id; // Assume the route has /:id as workspaceId by default

      // Resolve workspaceId if the route is for a board, list, or task directly
      if (req.baseUrl.startsWith('/api/boards')) {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: 'Board not found' });
        workspaceId = board.workspaceId;
      } else if (req.baseUrl.startsWith('/api/lists')) {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });
        const board = await Board.findById(list.boardId);
        workspaceId = board.workspaceId;
      } else if (req.baseUrl.startsWith('/api/tasks')) {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        const list = await List.findById(task.listId);
        const board = await Board.findById(list.boardId);
        workspaceId = board.workspaceId;
      }
      // If it starts with /api/workspaces, workspaceId is already req.params.id

      if (!workspaceId) {
        return res.status(400).json({ message: 'Could not determine workspace context' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const member = workspace.members.find(m => m.userId.toString() === req.user.id);
      
      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this workspace' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server Error in role check' });
    }
  };
};
