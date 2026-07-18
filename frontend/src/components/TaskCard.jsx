import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const TaskCard = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-panel task-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <span className="task-title">{task.title}</span>
        <div {...attributes} {...listeners} className="drag-handle">
          <GripVertical size={16} color="var(--text-secondary)" />
        </div>
      </div>
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}
    </div>
  );
};

export default TaskCard;
