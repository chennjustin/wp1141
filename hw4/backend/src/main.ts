import dotenv from 'dotenv';
import app from './app';

// 載入環境變數
dotenv.config();

const PORT = process.env['PORT'] || 3000;

app.listen(PORT, () => {
  console.log('🚀 TravelSpot Journal Backend API 已啟動');
  console.log(`📍 伺服器地址: http://localhost:${PORT}`);
  console.log(`🔗 健康檢查: http://localhost:${PORT}/health`);
  console.log('📊 資料庫: SQLite (Prisma)');
  console.log('🔐 認證: JWT');
  console.log(`🌐 CORS 來源: ${process.env['CORS_ORIGINS'] || 'http://localhost:5173'}`);
  console.log('\nAPI 端點:');
  console.log('  POST /auth/register    - 註冊');
  console.log('  POST /auth/login       - 登入');
  console.log('  GET  /folders          - 取得資料夾樹');
  console.log('  POST /folders          - 新增資料夾');
  console.log('  PUT  /folders/:id      - 更新資料夾');
  console.log('  DELETE /folders/:id    - 刪除資料夾');
  console.log('  GET  /places           - 取得地點');
  console.log('  POST /places           - 新增地點');
  console.log('  PUT  /places/:id       - 更新地點');
  console.log('  DELETE /places/:id     - 刪除地點');
  console.log('  GET  /entries          - 取得造訪紀錄');
  console.log('  POST /entries          - 新增造訪紀錄');
  console.log('  POST /maps/geocode      - 地址轉座標');
  console.log('  POST /maps/places-search - 地點搜尋');
});
