const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  labels: [{ type: String }],
  dueDate: { type: Date },
  order: { type: Number, required: true }, // Fractional index
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
