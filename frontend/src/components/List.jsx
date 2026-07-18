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
    <div className="glass-panel board-list">
      <div className="list-header">
        <h3>{list.title}</h3>
        <span className="task-count">{list.tasks.length}</span>
      </div>
      
      <div ref={setNodeRef} className="list-task-container">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map(task => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default List;
