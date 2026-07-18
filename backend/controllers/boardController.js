const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

// @route   POST /api/workspaces/:id/boards
exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const createdBy = req.user.id;
    const workspaceId = req.params.id;
    
    const board = new Board({
      workspaceId,
      title,
      createdBy
    });
    
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   GET /api/boards/:id
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    
    // Fetch lists and tasks
    const lists = await List.find({ boardId: board._id }).sort({ order: 1 });
    // We will structure tasks within lists in the response for frontend convenience
    const listsWithTasks = await Promise.all(lists.map(async (list) => {
      const tasks = await Task.find({ listId: list._id }).sort({ order: 1 });
      return { ...list.toObject(), tasks };
    }));

    res.json({
      ...board.toObject(),
      lists: listsWithTasks
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   DELETE /api/boards/:id
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    
    // Cascade delete lists and tasks
    const lists = await List.find({ boardId: board._id });
    const listIds = lists.map(l => l._id);
    await Task.deleteMany({ listId: { $in: listIds } });
    await List.deleteMany({ boardId: board._id });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
