/**
 * 使用者認證路由
 * 處理註冊、登入等認證相關請求
 */

import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/register
 * 使用者註冊
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 驗證輸入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '請提供使用者名稱、電子郵件和密碼' });
    }

    // 檢查使用者名稱是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: '使用者名稱已存在' });
    }

    // 檢查電子郵件是否已存在
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: '電子郵件已被註冊' });
    }

    // 密碼長度驗證
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少為6位' });
    }

    // 都通過前面的驗證後，開始加密密碼
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 建立使用者
    const newUser = await User.create(username, email, hashedPassword);

    // 產生 JWT token
    const token = generateToken(newUser.id, newUser.username);

    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

/**
 * POST /auth/login
 * 使用者登入
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 驗證輸入
    if (!username || !password) {
      return res.status(400).json({ error: '請提供使用者名稱和密碼' });
    }

    // 查找使用者
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    // 產生 JWT token
    const token = generateToken(user.id, user.username);

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
