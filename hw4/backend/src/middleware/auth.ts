import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 擴展 Request 介面以包含 user 屬性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '缺少認證 token'
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未設定');
    }

    // 驗證 JWT token
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    
    // 從資料庫取得使用者資訊
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '使用者不存在'
      });
      return;
    }

    // 將使用者資訊附加到 request 物件
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '無效的 token'
      });
      return;
    }

    console.error('認證錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '認證過程中發生錯誤'
    });
  }
};

export default authenticateToken;
