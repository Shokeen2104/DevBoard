import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    // A real app would have a GET /api/workspaces route that lists all workspaces for a user.
    // For this capstone demo, since we didn't add a "getAllWorkspaces" route to the spec, 
    // we'll just allow creating one and immediately creating a board in it.
    // Ideally, we'd fetch workspaces here.
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces([...workspaces, data]);
      setNewWorkspaceName('');
      setSelectedWorkspace(data._id);
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
      await api.post(`/boards/${data._id}/lists`, { title: 'To Do', order: 1000 });
      await api.post(`/boards/${data._id}/lists`, { title: 'In Progress', order: 2000 });
      await api.post(`/boards/${data._id}/lists`, { title: 'Done', order: 3000 });

      navigate(`/board/${data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Welcome, {user?.name || 'User'}</h2>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>1. Create a Workspace</h3>
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

      {selectedWorkspace && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>2. Create a Board in this Workspace</h3>
          <form onSubmit={handleCreateBoard} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input 
              className="input-field" 
              value={newBoardTitle} 
              onChange={e => setNewBoardTitle(e.target.value)} 
              placeholder="Board Title" 
              required 
            />
            <button className="btn btn-primary" type="submit">Create Board</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
