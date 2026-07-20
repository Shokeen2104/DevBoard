import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import api from '../api/axios';

const List = ({ list }) => {
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { type: 'List', list }
  });

  const taskIds = list.tasks.map(t => t._id);

  const handleAddTask = async () => {
    const title = window.prompt("Enter task title:");
    if (!title) return;
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
      
      <button className="add-task-btn" onClick={handleAddTask}>
        <span>+</span> Add task
      </button>
    </div>
  );
};

export default List;
