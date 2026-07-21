import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Board from '../components/Board';
import useBoardStore from '../store/boardStore';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';
import useSocket from '../hooks/useSocket';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';

const BoardView = () => {
  const { id } = useParams();
  const fetchBoard = useBoardStore(state => state.fetchBoard);
  const board = useBoardStore(state => state.board);
  const isLoading = useBoardStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);
  const workspaces = useWorkspaceStore(state => state.workspaces);
  const fetchWorkspaces = useWorkspaceStore(state => state.fetchWorkspaces);

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null); // { type: 'success'|'error', message }
  const [inviteLoading, setInviteLoading] = useState(false);

  // Initialize Socket.io connection for this board
  useSocket(id);

  useEffect(() => {
    if (id) {
      fetchBoard(id);
    }
  }, [id, fetchBoard]);

  const handleInvite = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    setInviteLoading(true);
    setInviteStatus(null);

    try {
      // 1. Find the user by email
      const { data: foundUser } = await api.get(`/auth/find?email=${encodeURIComponent(email)}`);
      
      // 2. Add them to the workspace
      const workspace = workspaces.find(w => w._id === board.workspaceId);
      await api.post(`/workspaces/${workspace._id}/members`, { 
        userId: foundUser._id, 
        role: 'member' 
      });

      setInviteStatus({ type: 'success', message: `${foundUser.name} has been invited!` });
      setInviteEmail('');
      fetchWorkspaces(); // refresh workspace members
      
      // Auto-clear success message
      setTimeout(() => setInviteStatus(null), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to invite user';
      setInviteStatus({ type: 'error', message: msg });
    } finally {
      setInviteLoading(false);
    }
  };

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
  const members = workspace?.members || [];
  if (workspace) {
    const currentMember = workspace.members.find(m => 
      m.userId === user?.id || (m.userId._id && m.userId._id === user?.id)
    );
    if (currentMember && ['owner', 'admin'].includes(currentMember.role)) {
      canManageMembers = true;
    }
  }

  const avatarColors = ['#2b73d6', '#3b2575', '#573312', '#1a5937', '#094a8f', '#8b5cf6'];

  return (
    <div className="board-container">
      <div className="board-header">
        <div className="board-header-left">
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>◫</span>
          <h2 className="board-title">{board.title}</h2>
        </div>
        
        <div className="board-header-right">
          <div className="avatar-group">
            {members.map((m, i) => {
              const memberName = m.userId?.name || m.userId?.email || '?';
              const memberInitials = memberName.substring(0, 2).toUpperCase();
              return (
                <div 
                  key={m.userId?._id || m.userId || i} 
                  className="avatar" 
                  style={{ background: avatarColors[i % avatarColors.length], zIndex: members.length - i }}
                  title={`${memberName} (${m.role})`}
                >
                  {memberInitials}
                </div>
              );
            })}
          </div>

          {canManageMembers && (
            isInviting ? (
              <form onSubmit={handleInvite} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address..."
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') { setIsInviting(false); setInviteStatus(null); } }}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: '220px'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={inviteLoading}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                >
                  {inviteLoading ? 'Sending...' : 'Invite'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsInviting(false); setInviteEmail(''); setInviteStatus(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
                {inviteStatus && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: inviteStatus.type === 'success' ? '#22c55e' : '#ef4444',
                    whiteSpace: 'nowrap'
                  }}>
                    {inviteStatus.message}
                  </span>
                )}
              </form>
            ) : (
              <button className="btn-outline" onClick={() => setIsInviting(true)}>
                <span style={{ fontSize: '1rem' }}>+</span> Invite
              </button>
            )
          )}
        </div>
      </div>
      
      <Board />
    </div>
  );
};

export default BoardView;
