/**
 * JWT 認證中間件
 * 用於保護需要登入的路由
 */

import jwt from 'jsonwebtoken';

/**
 * 驗證 JWT token 的中間件
 */
export function authenticateToken(req, res, next) {
  // 從請求標頭取得 token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '未提供存取權限' });
  }

  // 驗證 token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無效或過期的權限' });
    }
    
    // 將使用者資訊新增到請求物件
    req.user = user;
    next();
  });
}

/**
 * 產生 JWT token
 */
export function generateToken(userId, username) {
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7天有效期限
  );
}

