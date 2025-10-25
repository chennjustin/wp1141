import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // 記錄錯誤
  console.error('Error:', err);

  // Prisma 錯誤處理
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = '資料庫操作失敗';
    error = { name: 'DatabaseError', message, statusCode: 400 } as AppError;
  }

  // Prisma 驗證錯誤
  if (err.name === 'PrismaClientValidationError') {
    const message = '資料驗證失敗';
    error = { name: 'ValidationError', message, statusCode: 400 } as AppError;
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    const message = '無效的認證令牌';
    error = { name: 'AuthError', message, statusCode: 401 } as AppError;
  }

  // 過期令牌
  if (err.name === 'TokenExpiredError') {
    const message = '認證令牌已過期';
    error = { name: 'AuthError', message, statusCode: 401 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '伺服器內部錯誤',
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`找不到路由 - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};
