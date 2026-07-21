import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(state => state.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore(state => state.setActiveWorkspace);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const [isAddingWs, setIsAddingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  const getWorkspaceIconColor = (index) => {
    const colors = ['#2b73d6', '#3b2575', '#573312', '#1a5937'];
    return colors[index % colors.length];
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: '260px', width: '260px' }}>
      <div style={{ padding: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        Workspaces
      </div>
      
      <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="workspace-nav-list">
          {workspaces.map((ws, index) => (
            <div 
              key={ws._id} 
              className={`workspace-nav-item ${activeWorkspaceId === ws._id ? 'active' : ''}`}
              onClick={() => {
                setActiveWorkspace(ws._id);
                navigate('/');
              }}
            >
              <div 
                className="workspace-nav-icon" 
                style={{ background: getWorkspaceIconColor(index) }}
              />
              <span>{ws.name}</span>
            </div>
          ))}
        </div>
        {isAddingWs ? (
          <div style={{ padding: '0.5rem 1rem' }}>
            <input 
              type="text" 
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsAddingWs(false);
                if (e.key === 'Enter') {
                  if (newWsName.trim()) {
                    import('../api/axios').then(({ default: api }) => {
                      api.post('/workspaces', { name: newWsName.trim() }).then(() => {
                        useWorkspaceStore.getState().fetchWorkspaces();
                        setIsAddingWs(false);
                        setNewWsName('');
                      });
                    });
                  }
                }
              }}
              onBlur={() => {
                // timeout to allow click on enter/button if we had one
                setTimeout(() => setIsAddingWs(false), 100);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ) : (
          <button className="add-workspace-btn" onClick={() => setIsAddingWs(true)}>
            <span>+</span> Add workspace
          </button>
        )}
      </div>
      
      {/* Profile Section */}
      <div style={{ 
        padding: '1.5rem', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginTop: 'auto' 
      }}>
        <div className="avatar" style={{ background: 'var(--accent-blue)', width: '32px', height: '32px', fontSize: '0.8rem' }}>
          {initials}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'User'}
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
