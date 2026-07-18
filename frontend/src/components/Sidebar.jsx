import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useWorkspaceStore from '../store/workspaceStore';

const Sidebar = () => {
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const [expanded, setExpanded] = useState({});
  const location = useLocation();

  const toggleWorkspace = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        DevBoard
      </div>
      <div className="sidebar-content">
        {workspaces.map(ws => (
          <div key={ws._id} className="workspace-item">
            <div 
              className="workspace-title"
              onClick={() => toggleWorkspace(ws._id)}
            >
              <span>{ws.name}</span>
              <span>{expanded[ws._id] ? '▾' : '▸'}</span>
            </div>
            
            {expanded[ws._id] && ws.boards.map(board => (
              <Link 
                key={board._id}
                to={`/board/${board._id}`}
                className={`board-link ${location.pathname === `/board/${board._id}` ? 'active' : ''}`}
              >
                # {board.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
