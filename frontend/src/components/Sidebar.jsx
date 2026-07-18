import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [expanded, setExpanded] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const toggleWorkspace = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-header">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>DevBoard</Link>
      </div>
      <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
        {workspaces.map(ws => (
          <div key={ws._id} className="workspace-item">
            <div 
              className="workspace-title"
              onClick={() => toggleWorkspace(ws._id)}
            >
              <span>{ws.name}</span>
              <span>{expanded[ws._id] ? '▾' : '▸'}</span>
            </div>
            
            {expanded[ws._id] && (
              <>
                {ws.boards.map(board => (
                  <Link 
                    key={board._id}
                    to={`/board/${board._id}`}
                    className={`board-link ${location.pathname === `/board/${board._id}` ? 'active' : ''}`}
                  >
                    # {board.title}
                  </Link>
                ))}
                <Link to="/" className="board-link" style={{ color: 'var(--text-secondary)' }}>
                  + Add board
                </Link>
              </>
            )}
          </div>
        ))}
        
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
          <Link to="/" className="board-link" style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
            + Add workspace
          </Link>
        </div>
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
