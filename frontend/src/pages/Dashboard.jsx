import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);

  useEffect(() => {
    // Ideally we fetch workspaces here
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const { data: workspace } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces([...workspaces, workspace]);
      setNewWorkspaceName('');
      
      // Auto-create a board for the new workspace
      const { data: board } = await api.post(`/workspaces/${workspace._id}/boards`, { title: 'Main Board' });
      
      // Auto-create lists for the board
      const { data: todoList } = await api.post(`/boards/${board._id}/lists`, { title: 'To Do', order: 1000 });
      await api.post(`/boards/${board._id}/lists`, { title: 'In Progress', order: 2000 });
      await api.post(`/boards/${board._id}/lists`, { title: 'Done', order: 3000 });

      // Auto-create a placeholder card in To Do
      await api.post(`/lists/${todoList._id}/tasks`, { 
        title: 'Welcome to DevBoard! 🎉', 
        description: 'Drag this card to another list to see how it works.', 
        order: 1000 
      });

      // Refresh global workspaces so sidebar updates
      await fetchWorkspaces();

      // Navigate immediately to the new board
      navigate(`/board/${board._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!selectedWorkspace) return;
    try {
      const { data } = await api.post(`/workspaces/${selectedWorkspace}/boards`, { title: newBoardTitle });
      
      // Auto-create some starter lists for the new board
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

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Welcome, {user?.name || 'User'}</h2>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>Create a Workspace</h3>
        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input 
            className="input-field" 
            value={newWorkspaceName} 
            onChange={e => setNewWorkspaceName(e.target.value)} 
            placeholder="Workspace Name" 
            required 
          />
          <button className="btn btn-primary" type="submit">Create</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3>Create a Board in Existing Workspace</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Select a workspace to add a new board.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select 
            className="input-field" 
            value={selectedWorkspace || ''} 
            onChange={e => setSelectedWorkspace(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="" disabled>Select Workspace</option>
            {useWorkspaceStore(state => state.workspaces).map(ws => (
              <option key={ws._id} value={ws._id}>{ws.name}</option>
            ))}
          </select>
        </div>
        
        {selectedWorkspace && (
          <form onSubmit={handleCreateBoard} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              className="input-field" 
              value={newBoardTitle} 
              onChange={e => setNewBoardTitle(e.target.value)} 
              placeholder="Board Title" 
              required 
            />
            <button className="btn btn-primary" type="submit">Create Board</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
