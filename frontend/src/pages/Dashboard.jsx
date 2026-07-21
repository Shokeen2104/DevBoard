import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const Dashboard = () => {
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(state => state.activeWorkspaceId);
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isDeletingWs, setIsDeletingWs] = useState(false);

  const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId);
  
  const currentMember = activeWorkspace?.members?.find(m => 
    m.userId === user?.id || (m.userId._id && m.userId._id === user?.id)
  );
  const isOwner = currentMember?.role === 'owner';

  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${activeWorkspaceId}`);
      useWorkspaceStore.getState().setActiveWorkspace(null);
      await fetchWorkspaces();
    } catch (error) {
      console.error(error);
      alert("Failed to delete workspace");
    }
  };

  const handleCreateBoard = async () => {
    if (!activeWorkspaceId) return;
    const title = newBoardTitle.trim();
    if (!title) {
      setIsAddingBoard(false);
      return;
    }

    try {
      setIsAddingBoard(false);
      setNewBoardTitle('');
      const { data } = await api.post(`/workspaces/${activeWorkspaceId}/boards`, { title });
      
      // Auto-create lists for the new board
      const { data: todoList } = await api.post(`/boards/${data._id}/lists`, { title: 'To Do', order: 1000 });
      await api.post(`/boards/${data._id}/lists`, { title: 'In Progress', order: 2000 });
      await api.post(`/boards/${data._id}/lists`, { title: 'Done', order: 3000 });

      // Auto-create a placeholder card
      await api.post(`/lists/${todoList._id}/tasks`, { 
        title: 'New Task', 
        description: 'Start dragging cards.', 
        order: 1000 
      });

      await fetchWorkspaces();
      navigate(`/board/${data._id}`);
    } catch (err) {
      console.error(err);
      setIsAddingBoard(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        {workspaces.length === 0 ? "Create a workspace to get started" : "Select a workspace"}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="workspace-dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 className="workspace-title-main">{activeWorkspace.name}</h2>
            {isOwner && (
              isDeletingWs ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Are you sure?</span>
                  <button className="btn-outline" onClick={handleDeleteWorkspace} style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Yes</button>
                  <button className="btn-outline" onClick={() => setIsDeletingWs(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>No</button>
                </div>
              ) : (
                <button 
                  className="btn-outline" 
                  onClick={() => setIsDeletingWs(true)}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Delete Workspace
                </button>
              )
            )}
          </div>
          <div className="workspace-subtitle">{activeWorkspace.boards?.length || 0} boards</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => setIsAddingBoard(true)}>
            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span> New board
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="board-grid">
          {activeWorkspace.boards?.map((board, index) => {
            const barColors = [['#2b73d6', '#3b2575', '#573312'], ['#3b2575', '#1a5937', '#2b73d6'], ['#1a5937', '#573312', '#3b2575']];
            const colors = barColors[index % barColors.length];
            return (
              <Link key={board._id} to={`/board/${board._id}`} className="board-grid-card">
                <div className="board-card-graphic">
                  <div className="graphic-bar" style={{ height: '50px', background: colors[0] }}></div>
                  <div className="graphic-bar" style={{ height: '80px', background: colors[1] }}></div>
                  <div className="graphic-bar" style={{ height: '30px', background: colors[2] }}></div>
                </div>
                <div>
                  <div className="board-card-title">{board.title}</div>
                  <div className="board-card-meta">
                    {Math.floor(Math.random() * 10) + 1} cards · updated today
                  </div>
                </div>
              </Link>
            );
          })}
          
          {isAddingBoard ? (
            <div className="new-board-card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', cursor: 'default' }}>
              <input 
                type="text" 
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board title..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                  if (e.key === 'Escape') {
                    setIsAddingBoard(false);
                    setNewBoardTitle('');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-darker)',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <button className="btn btn-primary" onClick={handleCreateBoard} style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', flex: 1 }}>Create</button>
                <button className="btn-outline" onClick={() => setIsAddingBoard(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="new-board-card" onClick={() => setIsAddingBoard(true)}>
              <span style={{ fontSize: '1.5rem', fontWeight: 300 }}>+</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>New board</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
