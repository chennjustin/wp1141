import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(res: Response, data: T, message: string = '操作成功') => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  res.json(response);
};

export const sendError = (res: Response, message: string, statusCode: number = 400) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: message
  };
  res.status(statusCode).json(response);
};

export const sendNotFound = (res: Response, message: string = '找不到資源') => {
  sendError(res, message, 404);
};

export const sendUnauthorized = (res: Response, message: string = '未授權') => {
  sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message: string = '禁止訪問') => {
  sendError(res, message, 403);
};

export const sendServerError = (res: Response, message: string = '伺服器內部錯誤') => {
  sendError(res, message, 500);
};
