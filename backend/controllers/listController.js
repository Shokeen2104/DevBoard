const List = require('../models/List');

// @route   POST /api/boards/:id/lists
exports.createList = async (req, res) => {
  try {
    const { title, order } = req.body;
    const boardId = req.params.id;
    
    const list = new List({
      boardId,
      title,
      order: order || 0 // Provide a default order if not specified
    });
    
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PATCH /api/lists/:id
exports.updateList = async (req, res) => {
  try {
    const { title, order } = req.body;
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (title !== undefined) list.title = title;
    if (order !== undefined) list.order = order;
    
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
