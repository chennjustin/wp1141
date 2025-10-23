
/**
 * BikeRoute Planner - 後端伺服器
 * Express + SQLite + JWT 認證
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import routeRoutes from './routes/routes.js';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 設定 - 支援多個來源
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

console.log('允許的 CORS 來源:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BikeRoute Planner API 執行正常' });
});

// API 路由
//所有 /auth/... 的請求交給 authRoutes 處理
app.use('/auth', authRoutes);
//所有 /api/routes/... 的請求交給 routeRoutes 處理
app.use('/api/routes', routeRoutes);

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: '路由不存在' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// 啟動伺服器
async function startServer() {
  try {
    // 初始化資料庫
    await initDatabase();
    
    // 啟動 HTTP 伺服器
    app.listen(PORT, () => {
      console.log(`BikeRoute Planner 後端伺服器執行在 http://localhost:${PORT}`);
      console.log(`資料庫: SQLite (bikeroute.db)`);
      console.log(`Google Maps API: ${process.env.GOOGLE_MAPS_SERVER_KEY ? '已配置' : '未配置'}`);
      console.log(`CORS 來源: ${corsOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
}

startServer();
