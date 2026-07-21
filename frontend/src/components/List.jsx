import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import api from '../api/axios';

const List = ({ list }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { type: 'List', list }
  });

  const taskIds = list.tasks.map(t => t._id);

  const handleAddTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    
    const title = newTaskTitle.trim();
    setNewTaskTitle('');
    setIsAdding(false);

    try {
      const order = list.tasks.length > 0 
        ? list.tasks[list.tasks.length - 1].order + 1000 
        : 1000;
        
      await api.post(`/lists/${list._id}/tasks`, { 
        title, 
        order 
      });
      // The new task will be added to the UI automatically via the 'task:created' socket event
    } catch (err) {
      console.error("Failed to add task", err);
      alert("Failed to create task");
    }
  };

  return (
    <div className="board-list">
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <span className="task-count">{list.tasks.length}</span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className={`list-task-container ${list.title === 'In progress' ? 'focused' : ''}`}
        style={{ borderColor: list.title === 'In progress' ? 'var(--accent-blue)' : 'var(--border-color)' }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map(task => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>
      
      {isAdding ? (
        <form onSubmit={handleAddTask} style={{ marginTop: '0.5rem' }}>
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            autoFocus
            onBlur={handleAddTask}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Add card</button>
            <button type="button" onPointerDown={() => setIsAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
          </div>
        </form>
      ) : (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          <span>+</span> Add task
        </button>
      )}
    </div>
  );
};

export default List;
