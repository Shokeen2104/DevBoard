import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';

const Navbar = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="nav-brand" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>DevBoard</Link>
        
        {isAuthenticated && (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn" 
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Workspaces ▾
            </button>
            
            {showDropdown && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  marginTop: '0.5rem', 
                  background: 'var(--bg-color)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px',
                  width: '250px',
                  zIndex: 1000,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  padding: '0.5rem'
                }}
              >
                {workspaces.length === 0 ? (
                  <div style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No workspaces found</div>
                ) : (
                  workspaces.map(ws => (
                    <div key={ws._id} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ padding: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-color)' }}>
                        {ws.name}
                      </div>
                      {ws.boards.length === 0 ? (
                        <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No boards</div>
                      ) : (
                        ws.boards.map(board => (
                          <Link 
                            key={board._id} 
                            to={`/board/${board._id}`}
                            onClick={() => setShowDropdown(false)}
                            style={{ 
                              display: 'block', 
                              padding: '0.5rem 1rem', 
                              color: 'white', 
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              borderRadius: '4px'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            {board.title}
                          </Link>
                        ))
                      )}
                    </div>
                  ))
                )}
                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                   <Link to="/" onClick={() => setShowDropdown(false)} style={{ display: 'block', padding: '0.5rem', color: 'white', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' }}>
                     + Create New
                   </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nav-profile">
        {isAuthenticated ? (
          <button className="btn" onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Logout</button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
