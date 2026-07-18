import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BoardView from './pages/BoardView';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);
  
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">DevBoard</div>
          <div className="nav-profile">
            {isAuthenticated ? (
              <button className="btn" onClick={logout} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Logout</button>
            ) : null}
          </div>
        </nav>
        
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/board/:id" element={<ProtectedRoute><BoardView /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
