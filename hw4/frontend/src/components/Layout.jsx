/**
 * 主布局元件
 * 包含導航列和路由出口
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🚴 BikeRoute Planner
          </Link>
          
          {isAuthenticated ? (
            <div className="nav-menu">
              <Link to="/" className="nav-link">規劃路線</Link>
              <Link to="/routes" className="nav-link">我的路線</Link>
              <span className="nav-user">👤 {user?.username}</span>
              <button onClick={handleLogout} className="nav-logout">
                登出
              </button>
            </div>
          ) : (
            <div className="nav-menu">
              <Link to="/login" className="nav-link">登入</Link>
              <Link to="/register" className="nav-link">註冊</Link>
            </div>
          )}
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
