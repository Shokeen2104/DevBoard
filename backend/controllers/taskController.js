const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const List = require('../models/List');
const { getIo } = require('../config/socket');

// @route   POST /api/lists/:id/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const createdBy = req.user.id;
    const listId = req.params.id;
    
    const task = new Task({
      listId,
      title,
      description,
      order: order || 0,
      createdBy
    });
    
    await task.save();

    const list = await List.findById(listId);

    // Log activity
    await ActivityLog.create({
      taskId: task._id,
      actor: createdBy,
      action: 'created',
      meta: { title }
    });

    if (list) {
      getIo().to(`board:${list.boardId}`).emit('task:created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PATCH /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { title, description, listId, order, lastUpdatedAt } = req.body;
    const actorId = req.user.id;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Conflict handling: last-write-wins with a timestamp check.
    // If the client's last known timestamp is older than the DB's, reject the update.
    // The client will rollback and reconcile via the socket broadcast.
    if (lastUpdatedAt && new Date(lastUpdatedAt) < task.updatedAt) {
      return res.status(409).json({ message: 'Conflict: Task was modified by another user. Please refresh.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (listId !== undefined) updates.listId = listId;
    if (order !== undefined) updates.order = order;
    
    Object.assign(task, updates);
    await task.save();

    const list = await List.findById(task.listId);

    // Log activity if actorId is provided (mocking auth for now)
    if (actorId) {
      let action = 'updated';
      if (listId !== undefined && listId !== task.listId.toString()) action = 'moved';
      await ActivityLog.create({
        taskId: task._id,
        actor: actorId,
        action,
        meta: updates
      });
      
      if (list) {
        if (action === 'moved') {
          getIo().to(`board:${list.boardId}`).emit('task:moved', task);
        } else {
          getIo().to(`board:${list.boardId}`).emit('task:updated', task);
        }
      }
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const list = await List.findById(task.listId);
    await ActivityLog.deleteMany({ taskId: task._id });

    if (list) {
      getIo().to(`board:${list.boardId}`).emit('task:deleted', task._id);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   GET /api/tasks/:id/activity
exports.getTaskActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ taskId: req.params.id })
      .populate('actor', 'name avatarUrl')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
