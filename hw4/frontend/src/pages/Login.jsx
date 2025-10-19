/**
 * 登入頁面
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🚴 BikeRoute Planner</h1>
        <h2>登入</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">使用者名稱</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="請輸入使用者名稱"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="請輸入密碼"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        
        <p className="auth-link">
          還沒有帳號？ <Link to="/register">立即註冊</Link>
        </p>
      </div>
    </div>
  );
}
