# TravelSpot Journal

一個完整的旅遊景點記錄應用程式，包含前端和後端服務。

## 專案結構

```
hw4/
├── frontend/                # React 前端應用
│   ├── src/                # 原始碼
│   ├── public/             # 靜態資源
│   ├── package.json        # 前端依賴
│   └── README.md           # 前端說明
└── README.md               # 專案總說明
```

## 快速開始

### 前端 (React + TypeScript + Vite)

1. 進入前端目錄：
   ```bash
   cd frontend
   ```

2. 安裝依賴：
   ```bash
   npm install
   ```

3. 設定環境變數：
   ```bash
   cp .env.example .env
   ```
   
   編輯 `.env` 檔案，填入您的 Google Maps API Key：
   ```env
   VITE_GOOGLE_MAPS_JS_KEY=您的_Google_Maps_Browser_Key
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

   前端將在 `http://localhost:5173` 啟動。

## 功能特色

### 前端功能
- 🗺️ Google Maps 整合
- 📍 地圖點擊新增景點
- 📋 景點列表管理
- 🔍 地圖與列表互動
- 🎨 現代化 UI 設計

## 技術棧

### 前端
- **框架**: React 18 + TypeScript
- **建置工具**: Vite
- **路由**: React Router DOM
- **地圖**: Google Maps JavaScript API
- **樣式**: TailwindCSS
- **HTTP**: Axios

## 開發說明

### 前端開發
- 使用 `npm run dev` 啟動開發伺服器
- 使用 `npm run build` 建置生產版本
- 所有前端相關檔案都在 `frontend/` 目錄中

### 環境變數
- 前端需要設定 `VITE_GOOGLE_MAPS_JS_KEY` 來使用 Google Maps API
- 前端需要設定 `VITE_API_BASE_URL` 來連接後端 API

## 注意事項

- 請確保 Google Maps API Key 已正確設定
- 請將 `http://localhost:5173` 加入 API Key 的允許來源清單
- 前端目前可以獨立運行，不依賴後端服務
