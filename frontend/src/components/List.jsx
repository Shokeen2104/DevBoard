import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const List = ({ list }) => {
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { type: 'List', list }
  });

  const taskIds = list.tasks.map(t => t._id);

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
      
      <button className="add-task-btn">
        <span>+</span> Add task
      </button>
    </div>
  );
};

export default List;
