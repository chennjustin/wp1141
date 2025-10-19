/**
 * 註冊頁面
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 驗證密碼
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    if (password.length < 6) {
      setError('密碼長度至少為6位');
      return;
    }

    setLoading(true);

    const result = await register(username, email, password);
    
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
        <h2>註冊</h2>
        
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
            <label htmlFor="email">電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="請輸入電子郵件"
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
              placeholder="至少6位"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="請再次輸入密碼"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        
        <p className="auth-link">
          已有帳號？ <Link to="/login">立即登入</Link>
        </p>
      </div>
    </div>
  );
}
