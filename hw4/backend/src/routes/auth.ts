import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 註冊
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 驗證必填欄位
    if (!username || !email || !password) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供 username、email 和 password'
      });
      return;
    }

    // 檢查使用者是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Conflict',
        message: '使用者名稱或電子郵件已存在'
      });
      return;
    }

    // 雜湊密碼
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 建立使用者
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // 產生 JWT token
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未設定');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '註冊成功',
      user,
      token
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '註冊過程中發生錯誤'
    });
  }
});

// 登入
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 驗證必填欄位
    if (!username || !password) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供 username 和 password'
      });
      return;
    }

    // 尋找使用者
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '使用者名稱或密碼錯誤'
      });
      return;
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '使用者名稱或密碼錯誤'
      });
      return;
    }

    // 產生 JWT token
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未設定');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登入成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '登入過程中發生錯誤'
    });
  }
});

export default router;
