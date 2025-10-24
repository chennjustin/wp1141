import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 路由匯入
import authRoutes from './routes/auth';
import folderRoutes from './routes/folders';
import placeRoutes from './routes/places';
import entryRoutes from './routes/entries';
import mapRoutes from './routes/maps';

const app = express();

// 中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 設定
const corsOrigins = process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 健康檢查端點
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/places', placeRoutes);
app.use('/entries', entryRoutes);
app.use('/maps', mapRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
});

// 全域錯誤處理
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('錯誤:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
});

export default app;
