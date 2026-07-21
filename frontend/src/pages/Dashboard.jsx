import React from 'react';
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

  const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId);
  
  const currentMember = activeWorkspace?.members?.find(m => 
    m.userId === user?.id || (m.userId._id && m.userId._id === user?.id)
  );
  const isOwner = currentMember?.role === 'owner';

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Are you sure you want to delete workspace "${activeWorkspace.name}"? This action cannot be undone.`)) return;
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
    const title = window.prompt("Enter new board title:");
    if (!title) return;

    try {
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
              <button 
                className="btn-outline" 
                onClick={handleDeleteWorkspace}
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                Delete Workspace
              </button>
            )}
          </div>
          <div className="workspace-subtitle">{activeWorkspace.boards?.length || 0} boards</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-outline" onClick={handleCreateBoard}>
            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span> New board
          </button>
          <button className="btn-icon">
            ...
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
          
          <div className="new-board-card" onClick={handleCreateBoard}>
            <span style={{ fontSize: '1.5rem', fontWeight: 300 }}>+</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>New board</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
