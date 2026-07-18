import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useBoardStore from '../store/boardStore';

const useSocket = (boardId) => {
  const socketRef = useRef();
  
  const handleTaskCreated = useBoardStore(state => state.handleTaskCreated);
  const handleTaskMoved = useBoardStore(state => state.handleTaskMoved);
  const handleTaskDeleted = useBoardStore(state => state.handleTaskDeleted);

  useEffect(() => {
    if (!boardId) return;

    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit('joinBoard', boardId);

    socketRef.current.on('task:created', handleTaskCreated);
    socketRef.current.on('task:updated', handleTaskMoved); // same logic for now
    socketRef.current.on('task:moved', handleTaskMoved);
    socketRef.current.on('task:deleted', handleTaskDeleted);

    return () => {
      socketRef.current.emit('leaveBoard', boardId);
      socketRef.current.disconnect();
    };
  }, [boardId, handleTaskCreated, handleTaskMoved, handleTaskDeleted]);
};

export default useSocket;
