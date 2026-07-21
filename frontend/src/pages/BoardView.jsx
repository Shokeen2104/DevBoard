import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Board from '../components/Board';
import useBoardStore from '../store/boardStore';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';
import useSocket from '../hooks/useSocket';
import { Loader2 } from 'lucide-react';

const BoardView = () => {
  const { id } = useParams();
  const fetchBoard = useBoardStore(state => state.fetchBoard);
  const board = useBoardStore(state => state.board);
  const isLoading = useBoardStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);
  const workspaces = useWorkspaceStore(state => state.workspaces);

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  // Initialize Socket.io connection for this board
  useSocket(id);

  useEffect(() => {
    if (id) {
      fetchBoard(id);
    }
  }, [id, fetchBoard]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>Board not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This board may not exist or you don't have permission to view it.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Go to Dashboard</button>
      </div>
    );
  }

  let canManageMembers = false;
  const workspace = workspaces.find(w => w._id === board.workspaceId);
  if (workspace) {
    const currentMember = workspace.members.find(m => 
      m.userId === user?.id || (m.userId._id && m.userId._id === user?.id)
    );
    if (currentMember && ['owner', 'admin'].includes(currentMember.role)) {
      canManageMembers = true;
    }
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <div className="board-header-left">
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>◫</span>
          <h2 className="board-title">{board.title}</h2>
        </div>
        
        <div className="board-header-right">
          <div className="avatar-group">
            <div className="avatar" style={{ background: '#094a8f', zIndex: 1 }}>{initials}</div>
          </div>
          {canManageMembers && (
            <button className="btn-outline">
              <span style={{ fontSize: '1rem' }}>+</span> Invite
            </button>
          )}
        </div>
      </div>
      
      <Board />
    </div>
  );
};

export default BoardView;
