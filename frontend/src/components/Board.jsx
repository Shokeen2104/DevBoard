import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import List from './List';
import TaskCard from './TaskCard';
import useBoardStore from '../store/boardStore';

const Board = () => {
  const lists = useBoardStore(state => state.lists);
  const moveTask = useBoardStore(state => state.moveTask);
  const [activeTask, setActiveTask] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px drag before activation
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverList = over.data.current?.type === 'List';

    if (!isActiveTask) return;

    const sourceListId = active.data.current.task.listId;
    let destListId = null;
    let newOrder = 0;

    // Calculate fractional order (simplified for this demo, usually requires looking at siblings)
    // Real implementation would calculate midpoint between `over` task and its adjacent sibling.
    // For now, if we drop on a list, we append. If on a task, we place above it.

    if (isOverList) {
      destListId = overId;
      const destList = lists.find(l => l._id === destListId);
      const lastTask = destList.tasks[destList.tasks.length - 1];
      newOrder = lastTask ? lastTask.order + 1000 : 1000;
    } else if (isOverTask) {
      destListId = over.data.current.task.listId;
      const destList = lists.find(l => l._id === destListId);
      const overIndex = destList.tasks.findIndex(t => t._id === overId);
      
      const prevOrder = overIndex > 0 ? destList.tasks[overIndex - 1].order : 0;
      const nextOrder = destList.tasks[overIndex].order;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    if (destListId) {
      moveTask(activeId, sourceListId, destListId, newOrder);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-canvas">
        {lists.map(list => (
          <List key={list._id} list={list} />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
