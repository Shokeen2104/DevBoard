import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';
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

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      try {
        await api.patch(`/tasks/${task._id}`, { title: editTitle.trim() });
      } catch (err) {
        console.error("Failed to update task", err);
        setEditTitle(task.title);
      }
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
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
        <div className="task-title" style={{ flexGrow: 1 }}>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdate(e);
                if (e.key === 'Escape') {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.25rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            task.title
          )}
        </div>
        <div style={{ color: 'var(--text-secondary)', opacity: 0.5, marginTop: '2px', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {isDeleting ? (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-darker)', padding: '2px', borderRadius: '4px' }}>
              <button onClick={handleDelete} onPointerDown={e => e.stopPropagation()} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '2px', padding: '0 4px', fontSize: '10px', cursor: 'pointer' }}>Yes</button>
              <button onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }} onPointerDown={e => e.stopPropagation()} style={{ background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '0 4px', fontSize: '10px', cursor: 'pointer' }}>No</button>
            </div>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ 
                  background: 'none', border: 'none', color: 'inherit', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center' 
                }}
                title="Edit task"
              >
                <Edit2 size={15} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ 
                  background: 'none', border: 'none', color: 'inherit', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center' 
                }}
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
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
