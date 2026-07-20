import React from 'react';
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
        
        <button className="add-workspace-btn" onClick={() => {
          const name = window.prompt("Enter new workspace name:");
          if (name) {
            // Ideally, we'd fire an action here to create it. For now, it will trigger the Dashboard's effect or user can just use it.
            // Since Dashboard handles creation in this demo, maybe redirecting to a /create route is better, or firing api here.
            // Let's implement a quick API call here for seamless experience.
            import('../api/axios').then(({ default: api }) => {
              api.post('/workspaces', { name }).then(() => {
                useWorkspaceStore.getState().fetchWorkspaces();
              });
            });
          }
        }}>
          <span>+</span> Add workspace
        </button>
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
