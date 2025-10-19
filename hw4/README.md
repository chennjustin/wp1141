# 🚴 BikeRoute Planner - 自行車路線規劃應用程式

一個全端網頁應用程式，協助自行車騎士規劃最適合的路線，避開小巷，優先選擇有自行車道的道路，並顯示坡度資訊。

## 📋 專案簡介

BikeRoute Planner 是一個完整的全端網頁應用程式，結合了前端 React 介面和後端 Node.js API，提供以下功能：

- **使用者認證系統**：註冊、登入、登出功能，使用 JWT 權杖認證
- **路線規劃**：輸入起點、終點和途徑點，使用 Google Maps Directions API 規劃自行車路線
- **地圖視覺化**：即時顯示路線在地圖上，包含起點、終點和途徑點標記
- **路線管理**：儲存路線到個人帳號，可查看、刪除已儲存的路線
- **海拔資訊**：顯示路線的海拔爬升資料

## 🛠️ 技術堆疊

### 前端

- **React 18** - UI 框架
- **Vite** - 建構工具
- **React Router DOM** - 路由管理
- **Axios** - HTTP 客戶端
- **@react-google-maps/api** - Google Maps React 元件

### 後端

- **Node.js** - 執行環境
- **Express** - Web 框架
- **SQLite** - 資料庫
- **JWT (jsonwebtoken)** - 身份認證
- **bcrypt** - 密碼加密
- **Axios** - HTTP 客戶端（呼叫 Google APIs）

### 外部 API

- **Google Maps Directions API** - 路線規劃
- **Google Maps Geocoding API** - 地址轉座標
- **Google Maps Elevation API** - 海拔資料

## 📁 專案結構

```
bikeroute-planner/
├── backend/                      # 後端程式碼
│   ├── database.js               # 資料庫模型和操作
│   ├── server.js                 # Express 伺服器主檔案
│   ├── middleware/
│   │   └── auth.js              # JWT 認證中間件
│   ├── routes/
│   │   ├── auth.js              # 認證路由（註冊、登入）
│   │   └── routes.js            # 路線管理路由（CRUD）
│   ├── services/
│   │   └── googleMaps.js        # Google Maps API 整合服務
│   ├── package.json
│   └── env.example              # 環境變數範本
│
├── frontend/                     # 前端程式碼
│   ├── src/
│   │   ├── components/          # React 元件
│   │   ├── contexts/            # React Context
│   │   ├── pages/               # 頁面元件
│   │   └── services/            # API 服務
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── env.example              # 環境變數範本
│
└── README.md                     # 本檔案
```

## 🚀 快速開始

### 前置需求

- Node.js >= 16.0.0
- npm 或 yarn
- Google Maps API 金鑰（需要啟用 Directions API、Geocoding API 和 Elevation API）

### 1. 安裝依賴套件

#### 後端

```bash
cd backend
npm install
```

#### 前端

```bash
cd frontend
npm install
```

### 2. 設定環境變數

#### 後端環境變數

在 `backend` 目錄下建立 `.env` 檔案：

```env
PORT=3000

# 允許的前端網域 (CORS)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT 密鑰（用於簽名和驗證 token）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 已啟用 Geocoding / Places / Directions 的 Server Key
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY
```

#### 前端環境變數

在 `frontend` 目錄下建立 `.env` 檔案：

```env
VITE_GOOGLE_MAPS_JS_KEY=AIzaSyYourBrowserKeyHere
VITE_API_BASE_URL=http://localhost:3000
```

### 3. 取得 Google Maps API 金鑰

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Directions API
   - Geocoding API
   - Elevation API
4. 建立 API 金鑰
5. 將金鑰分別填入後端和前端的 `.env` 檔案

### 4. 啟動應用程式

#### 方式 1：使用啟動腳本（Windows）

```bash
start-dev.bat
```

#### 方式 2：手動啟動

**終端 1 - 後端**

```bash
cd backend
npm run dev
```

**終端 2 - 前端**

```bash
cd frontend
npm run dev
```

### 5. 存取應用程式

開啟瀏覽器，前往：**http://localhost:5173**

## 📖 使用說明

### 註冊和登入

1. 點擊「註冊」建立新帳號
2. 填寫使用者名稱、電子郵件和密碼
3. 註冊成功後自動登入

### 規劃路線

1. 登入後進入路線規劃頁面
2. 輸入路線名稱（例如：「上班路線」）
3. 輸入起點地址
4. 輸入終點地址
5. （選用）新增途徑點
6. 點擊「規劃路線」按鈕
7. 地圖上會顯示規劃好的路線
8. 查看路線統計資訊（距離、時間、海拔爬升）

### 管理路線

1. 點擊導覽列的「我的路線」
2. 查看所有儲存的路線
3. 點擊路線卡片查看詳情和地圖
4. 點擊「刪除」按鈕刪除不需要的路線

## 🔒 安全特性

- 密碼使用 bcrypt 加密儲存
- JWT Token 認證，有效期限 7 天
- 受保護的路由需要登入才能存取
- SQL 注入防護（使用參數化查詢）
- CORS 配置，限制允許的來源

## 📡 API 端點

### 認證端點

- `POST /auth/register` - 使用者註冊
- `POST /auth/login` - 使用者登入

### 路線端點（需要認證）

- `POST /api/routes` - 建立新路線
- `GET /api/routes` - 取得使用者的所有路線
- `GET /api/routes/:id` - 取得特定路線詳情
- `DELETE /api/routes/:id` - 刪除路線

## 🗄️ 資料庫結構

### users 表

- `id` - 主鍵
- `username` - 使用者名稱（唯一）
- `email` - 電子郵件（唯一）
- `password` - 加密後的密碼
- `created_at` - 建立時間

### routes 表

- `id` - 主鍵
- `user_id` - 使用者 ID（外鍵）
- `name` - 路線名稱
- `start_lat`, `start_lng` - 起點座標
- `start_address` - 起點地址
- `end_lat`, `end_lng` - 終點座標
- `end_address` - 終點地址
- `waypoints` - 途徑點（JSON）
- `distance` - 距離（公尺）
- `duration` - 預計時間（秒）
- `elevation_gain` - 海拔爬升（公尺）
- `polyline` - 路線編碼
- `created_at` - 建立時間

## 🐛 常見問題

### Google Maps 不顯示

- 檢查 API 金鑰是否正確
- 確認已啟用 Maps JavaScript API
- 檢查瀏覽器主控台是否有錯誤

### 路線規劃失敗

- 確認已啟用 Directions API、Geocoding API 和 Elevation API
- 檢查 API 配額是否超限
- 驗證地址格式是否正確

### 認證失敗

- 檢查後端伺服器是否執行中
- 驗證 JWT_SECRET 是否配置
- 清除瀏覽器 localStorage 重新登入

## 📝 授權

MIT License

## 👥 貢獻

歡迎提交 Issue 和 Pull Request！

---

**享受騎行！🚴‍♂️🚴‍♀️**
