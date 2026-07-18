const Workspace = require('../models/Workspace');
const Board = require('../models/Board');

// @route   GET /api/workspaces
exports.getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.userId': req.user.id });
    
    // Fetch boards for each workspace to display in navigation
    const workspacesWithBoards = await Promise.all(workspaces.map(async (workspace) => {
      const boards = await Board.find({ workspaceId: workspace._id });
      return {
        ...workspace.toObject(),
        boards
      };
    }));

    res.json(workspacesWithBoards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   POST /api/workspaces
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.id;
    const workspace = new Workspace({
      name,
      createdBy,
      members: [{ userId: createdBy, role: 'admin' }]
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   GET /api/workspaces/:id
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('members.userId', 'name email avatarUrl');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   POST /api/workspaces/:id/members
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    // Check if already a member
    if (workspace.members.find(m => m.userId.toString() === userId)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    workspace.members.push({ userId, role: role || 'member' });
    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PATCH /api/workspaces/:id/members/:userId
exports.changeMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const member = workspace.members.find(m => m.userId.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found in workspace' });

    member.role = role;
    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
