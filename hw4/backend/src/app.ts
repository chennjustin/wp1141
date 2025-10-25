import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';

// 載入環境變數
dotenv.config();

// 路由匯入
import authRoutes from './routes/auth';
import folderRoutes from './routes/folders';
import placeRoutes from './routes/places';
import entryRoutes from './routes/entries';
import mapRoutes from './routes/maps';
import searchRoutes from './routes/search';

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
app.use('/places-new', placeRoutes); // 新的 API 端點
app.use('/entries', entryRoutes);
app.use('/maps', mapRoutes);
app.use('/search', searchRoutes);

// 404 處理
app.use(notFound);

// 全域錯誤處理
app.use(errorHandler);

export default app;
