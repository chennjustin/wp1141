# TravelSpot Journal

一個基於 React + TypeScript + Express 的旅遊地點收藏與管理系統，讓使用者能夠在地圖上標記、分類和管理喜愛的旅遊地點。

## 專案概述

TravelSpot Journal 是一個現代化的旅遊地點管理應用程式，結合了 Google Maps API 的強大功能，讓使用者能夠：

- 在地圖上搜尋和標記旅遊地點
- 使用圖示分類不同類型的地點（美食、景點、住宿等）
- 建立資料夾來組織收藏的地點
- 記錄旅遊心得和評分
- 透過篩選功能快速找到特定類型的地點

## 技術架構

### 前端

- **React 19** - 現代化 UI 框架
- **TypeScript** - 型別安全的 JavaScript
- **Vite** - 快速的建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Router** - 單頁應用程式路由
- **@react-google-maps/api** - Google Maps React 整合

### 後端

- **Express.js** - Node.js Web 框架
- **TypeScript** - 型別安全的 JavaScript
- **Prisma** - 現代化資料庫 ORM
- **SQLite** - 輕量級資料庫
- **JWT** - JSON Web Token 認證
- **bcrypt** - 密碼雜湊
- **@googlemaps/google-maps-services-js** - Google Maps 服務端 API

### 資料庫

- **SQLite** - 使用 Prisma ORM 管理
- 支援使用者、資料夾、地點、造訪紀錄等實體

## 功能特色

### 地圖功能

- **互動式地圖**：基於 Google Maps 的完整地圖體驗
- **地點搜尋**：透過搜尋列快速找到想要的地點
- **地點標記**：點擊地圖上的 POI 或搜尋結果來標記地點
- **智慧縮放**：搜尋後自動縮放到適當範圍，減少不必要的動畫

### 地點管理

- **圖示分類**：提供 7 種主要類型圖示（美食、景點、住宿、購物、醫院、學校、公園）
- **自訂圖示**：額外提供多種圖示選擇
- **詳細資訊**：記錄地點名稱、地址、描述、評分等
- **視覺化標記**：在地圖上以不同圖示顯示各類型地點

### 資料夾系統

- **分類管理**：建立資料夾來組織收藏的地點
- **階層結構**：支援巢狀資料夾（未來擴展）
- **批量操作**：快速管理多個地點
- **滾動支援**：大量資料夾時提供良好的使用體驗

### 篩選功能

- **類型篩選**：根據圖示類型快速篩選地點
- **資料夾篩選**：按資料夾分類查看地點
- **即時更新**：篩選結果即時反映在地圖上

### 使用者體驗

- **響應式設計**：支援各種螢幕尺寸
- **直觀介面**：簡潔現代的 UI 設計
- **快速操作**：減少不必要的動畫和操作步驟
- **資料持久化**：所有資料安全儲存在資料庫中

## 使用方式

### 基本操作流程

1. **註冊/登入**

   - 首次使用需要註冊帳號
   - 登入後可開始使用所有功能
2. **搜尋地點**

   - 在頂部搜尋列輸入地點名稱或地址
   - 系統會顯示搜尋結果並自動縮放到該區域
   - 點擊地圖上的 POI 或搜尋結果來查看詳細資訊
3. **收藏地點**

   - 點擊地圖上的地點或搜尋結果
   - 在彈出的地點資訊視窗中點擊「新增地點」
   - 選擇適當的圖示和資料夾
   - 填寫地點名稱、描述等資訊
   - 點擊「儲存地點」完成收藏
4. **管理資料夾**

   - 點擊右上角的「資料夾」按鈕
   - 在資料夾管理頁面中：
     - 點擊資料夾名稱展開/收合地點列表
     - 使用「新增資料夾」按鈕建立新資料夾
     - 點擊垃圾桶圖示刪除不需要的資料夾
5. **篩選地點**

   - 使用右上角的篩選選單
   - 選擇「依類型篩選」或「依資料夾篩選」
   - 地圖會即時顯示符合條件的地點
6. **編輯地點**

   - 點擊地圖上的地點標記
   - 在左側資訊卡中點擊「編輯記錄」
   - 修改地點資訊後點擊「儲存」

### 進階功能

- **批量管理**：在資料夾管理頁面可以一次查看多個地點
- **智慧分類**：系統會根據選擇的圖示自動分類地點類型
- **搜尋優化**：支援中文和英文地點搜尋
- **地圖控制**：提供衛星圖和街道圖切換

## 環境設定

### Google Cloud Platform 設定

1. **建立 Google Cloud 專案**

   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 建立新專案或選擇現有專案
2. **建立與設定 API Key**

#### 前端 Key（Browser Key）

- **限制類型**：HTTP 網域
- **允許清單**：
  - `http://localhost:5173/*`
  - `http://127.0.0.1:5173/*`
- **啟用 API**：Maps JavaScript API

> **注意**：這是前端 Vite App 的 URL。如果因為任何因素導致前端的 port 不是 5173（可能會是 5174, 517*, 3000, etc），請重新確保前端是開在 5173，或者是修改這個設定。

#### 後端 Key（Server Key）

- **限制類型**：IP 位址
  - **注意**：由於目前 app 尚未 deploy，app 是跑在本地端，故可暫時無 IP 限制，但需注意安全風險
- **服務啟用規則（統一規格）**：為了確保同學們可以順利 review 彼此的作業，所以即使 app 不會完全使用到 Geocoding, Places, Directions 這三種 APIs，但還是請使用同一把 Server Key 同時啟用下列三項服務：
  - **Geocoding API**
  - **Places API**
  - **Directions API**

3. **建立 API 金鑰**
   - 在「API 和服務」→「憑證」中建立兩個 API 金鑰
   - 分別設定前端和後端的限制條件

### 環境變數設定

#### 後端環境變數 (.env)

```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=file:./dev.db
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY   # 已啟用 Geocoding/Places/Directions
```

#### 前端環境變數 (.env)

```env
VITE_GOOGLE_MAPS_JS_KEY=YOUR_BROWSER_KEY   # Maps JavaScript API（Browser Key）
VITE_API_BASE_URL=http://localhost:3000    # 後端 API 位址
```

> **注意**：這是前端 Vite App 的 URL。如果因為任何因素導致前端的 port 不是 5173（可能會是 5174, 517*, 3000, etc），請重新確保前端是開在 5173，或者是修改這個設定。

## 安裝與執行

### 前置需求

- Node.js 18+

### 1. 複製專案

```bash
git clone <repository-url>
cd hw4
```

### 2. 安裝依賴套件

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

### 3. 設定環境變數

- 複製並修改環境變數檔案
- 填入您的 Google Maps API 金鑰

### 4. 初始化資料庫

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. 啟動開發伺服器

#### 後端

```bash
cd backend
npm run dev
```

#### 前端

```bash
cd frontend
npm run dev
```

### 6. 開啟應用程式

- 前端：http://localhost:5173
- 後端 API：http://localhost:3000

## 生產環境部署

### 建置專案

#### 後端

```bash
cd backend
npm run build
npm start
```

#### 前端

```bash
cd frontend
npm run build
```

### 資料庫遷移

```bash
cd backend
npx prisma migrate deploy
```

## 專案結構

```
hw4/
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中介軟體
│   │   ├── services/       # 服務層
│   │   └── main.ts         # 應用程式入口
│   ├── prisma/
│   │   └── schema.prisma   # 資料庫結構
│   └── package.json
├── frontend/               # 前端應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/          # 頁面組件
│   │   ├── services/       # API 服務
│   │   ├── hooks/          # 自訂 Hooks
│   │   ├── contexts/       # React Context
│   │   └── types/          # TypeScript 型別
│   └── package.json
└── README.md
```

## 常見問題

### Q: Google Maps 不顯示？

A: 檢查前端 API 金鑰是否正確設定，並確認已啟用 Maps JavaScript API。

### Q: 地點搜尋沒有結果？

A: 確認後端 API 金鑰已啟用 Places API，並檢查 API 配額。

### Q: 資料庫連線失敗？

A: 確認 DATABASE_URL 設定正確，並執行 `npx prisma generate`。

### Q: 認證失敗？

A: 檢查 JWT_SECRET 是否設定，並確認使用者已正確註冊。
