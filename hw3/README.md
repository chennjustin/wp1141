# Cinema Booking System

電影院訂票與選位系統 - 純前端網頁服務

## 技術棧

- **React 18** - UI 框架
- **TypeScript** - 型別檢查
- **Vite** - 建構工具
- **TailwindCSS** - CSS 框架
- **Shadcn UI** - UI 組件庫
- **React Router** - 路由管理
- **PapaCSV** - CSV 資料解析

## 專案結構

```
hw3/
├── public/
│   └── data/
│       ├── movies.csv      # 電影資料
│       ├── halls.csv       # 影廳資料
│       └── screenings.csv  # 場次資料
├── src/
│   ├── components/         # React 組件
│   │   ├── ui/            # Shadcn UI 組件
│   │   └── Navbar.tsx     # 導覽列
│   ├── pages/             # 頁面組件
│   │   ├── Home.tsx       # 首頁
│   │   ├── Movies.tsx     # 電影列表
│   │   └── Cart.tsx       # 購物車
│   ├── context/           # Context API
│   │   └── MovieContext.tsx
│   ├── hooks/             # 自定義 Hooks
│   ├── utils/             # 工具函數
│   ├── lib/
│   │   └── utils.ts       # 共用工具
│   ├── App.tsx            # 主應用程式
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全域樣式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 功能模組

- **MovieList** - 顯示所有電影與搜尋功能
- **MovieDetail** - 顯示電影資訊與可選場次
- **SeatSelection** - 顯示座位圖供選擇
- **Cart** - 顯示目前暫存的選擇（可刪改）
- **Checkout** - 確認送出訂單

## 安裝與執行

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 建構專案

```bash
npm run build
```

### 預覽建構結果

```bash
npm run preview
```

## 開發說明

- 使用 `MovieContext` 進行全域狀態管理
- CSV 資料從 `public/data/` 目錄載入
- 使用 React Router 進行路由管理
- 所有 UI 組件基於 Shadcn UI 和 TailwindCSS

## 資料結構

### 電影 (movies.csv)
- movie_id, title, year, genres, runtime_min, audio_language, age_rating_tw, poster_url, synopsis

### 影廳 (halls.csv)
- hall_id, hall_name, capacity, seatmap_id

### 場次 (screenings.csv)
- screening_id, date, start_time, end_time, hall_id, movie_id, format, audio_language, subtitle_language, price_TWD

## 授權

此專案為教學用途。

