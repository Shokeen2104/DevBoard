import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import api from '../api/axios';

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

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await api.delete(`/tasks/${task._id}`);
      // boardStore will automatically remove it via socket event 'task:deleted'
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Failed to delete task");
    }
  };

  // Mock data for display if not present in DB
  const labels = task.labels?.length ? task.labels : (task.title.includes('offset') ? ['bug'] : (task.title.includes('Redis') ? ['feature'] : []));
  const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (task.title.includes('offset') ? 'Jul 22' : 'Jul 20');
  const assigneeInitials = task.assignee?.name ? task.assignee.name.substring(0,2).toUpperCase() : null;
  const avatarColor = '#094a8f';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} 
      {...listeners}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
    >
      {labels.length > 0 && (
        <div className="task-labels">
          {labels.map(label => (
            <span key={label} className={`label-pill label-${label.toLowerCase()}`}>
              {label}
            </span>
          ))}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div className="task-title">
          {task.title}
        </div>
        <div style={{ color: 'var(--text-secondary)', opacity: 0.5, marginTop: '2px', display: 'flex', gap: '0.25rem' }}>
          <button 
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ 
              background: 'none', border: 'none', color: 'inherit', 
              cursor: 'pointer', display: 'flex', alignItems: 'center' 
            }}
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
          <GripVertical size={16} style={{ cursor: 'grab' }} />
        </div>
      </div>
      
      <div className="task-footer">
        <div className="task-date">
          <span>☐</span> {dateStr}
        </div>
        
        {assigneeInitials && (
          <div className="avatar" style={{ background: avatarColor, width: '24px', height: '24px', fontSize: '0.65rem' }}>
            {assigneeInitials}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
