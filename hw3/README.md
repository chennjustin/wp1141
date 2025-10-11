# 🎬 CHCCCinema 電影訂票系統

## 🚀 如何啟動專案

### 環境需求

- Node.js 16.0 或更高版本
- npm 或 yarn 套件管理工具

### 安裝與啟動步驟

1. **複製專案**

```bash
git clone <repository-url>
cd wp1141/hw3
```

2. **安裝相關套件**

```bash
npm install
```

3. **啟動開發伺服器**

```bash
npm run dev
```

4. **開啟瀏覽器**

```
http://localhost:5173
```

### 其他指令

```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 檢查程式碼品質
npm run lint
```

---

## 🏗️ 專案架構

### 技術框架

- **前端框架**: React 18 + TypeScript
- **路由管理**: React Router DOM
- **CSS 設計**: Tailwind CSS
- **動畫效果**: Framer Motion
- **圖標庫**: Lucide React
- **建置工具**: Vite
- **資料格式**: CSV

### 專案結構

```
src/
├── components/          # 可重用組件
│   ├── common/         # 通用組件 (Modal, Marquee, RatingIcon)
│   ├── feedback/       # 回饋組件 (Toast, Modal)
│   ├── guide/          # 使用指南組件
│   ├── home/           # 首頁專用組件
│   ├── movies/         # 電影相關組件
│   └── ui/             # UI 基礎組件
├── context/            # 全域狀態管理
├── hooks/              # 自定義 Hooks
├── lib/                # 工具函數
├── pages/              # 頁面組件
├── utils/              # 資料處理工具
└── types/              # TypeScript 類型定義

public/
└── data/               # 靜態資料檔案
    ├── movies.csv      # 電影資料
    ├── halls.csv       # 影廳資料
    └── screenings.csv  # 場次資料
```

---

## 📱 頁面功能說明

### 🏠 首頁 (Home)

- **Hero 輪播**: 展示電影，可自動播放與點按左右的按紐手動切換
- **現正熱映**: 電影卡片展示，包含海報、標題、評分
- **使用指南**: 彈出式教學 Modal

### 🎬 電影列表 (Movies)

- **電影篩選**: 依類型、年份、評級篩選
- **搜尋功能**: 搜尋電影標題

### 🎭 電影詳情 (MovieDetail)

- **電影資訊**: 海報、標題、劇情簡介
- **場次**: 可以選擇不同日期與時間的場次
- **影廳資訊**: 顯示影廳類型與座位數
- **立即訂票**: 直接開始選擇座位

### 💺 座位選擇 (SeatSelection)

- **座位圖**: 預設影廳座位配置
- **座位狀態**: 可選(白)、已選(藍)、售出(灰)
- **購物車**: 確認選擇後加入購物車

### 🛒 購物車 (Cart)

- **訂單管理**: 顯示所有待結帳項目
- **座位資訊**: 電影、場次、座位詳細資訊
- **金額計算**: 自動計算總金額與票數
- **編輯功能**: 修改或刪除訂單項目

### 💳 結帳頁面 (Checkout)

- **訂單確認**: 最終確認所有訂單資訊
- **付款流程**: 模擬付款處理過程
- **訂單完成**: 顯示訂單編號與狀態
- **後續操作**: 查看歷史訂單或繼續購票

### 📋 歷史訂單 (History)

- **訂單記錄**: 顯示所有已完成訂單
- **詳細資訊**: 電影、場次、座位、金額
- **時間排序**: 依訂單時間排列
- **清除記錄**: 一鍵清除所有歷史記錄

---

## 📊 資料結構

### 🎬 電影資料 (movies.csv)

```csv
movie_id,title,eng_title,year,genres,runtime_min,audio_language,age_rating_tw,poster_url,big_screen_photo_url,synopsis
```

**欄位說明**:

- `movie_id`: 電影ID
- `title`: 中文電影標題
- `eng_title`: 英文電影標題
- `year`: 上映年份
- `genres`: 電影類型
- `runtime_min`: 片長 (min)
- `audio_language`: 主要語言
- `age_rating_tw`: 台灣分級制度
- `poster_url`: 電影海報圖片 URL
- `big_screen_photo_url`: 大螢幕背景圖片 URL
- `synopsis`: 劇情簡介

### 🏢 影廳資料 (halls.csv)

```csv
hall_id,hall_name,hall_type,capacity,features
```

**欄位說明**:

- `hall_id`: 影廳ID
- `hall_name`: 影廳名稱
- `hall_type`: 影廳類型 (一般廳、IMAX、3D)
- `capacity`: 座位數
- `features`: 影廳特色 (逗號分隔)

### 🎫 場次資料 (screenings.csv)

```csv
screening_id,date,start_time,end_time,hall_id,movie_id,format,audio_language,subtitle_language,price_TWD
```

**欄位說明**:

- `screening_id`: 場次ID
- `date`: 放映日期
- `start_time`: 開始時間
- `end_time`: 結束時間
- `hall_id`: 影廳 ID (關聯 halls.csv)
- `movie_id`: 電影 ID (關聯 movies.csv)
- `format`: 放映格式 (2D、3D、IMAX)
- `audio_language`: 音軌語言
- `subtitle_language`: 字幕語言
- `price_TWD`: 票價 (NT)

### 📖 資料讀取方式

```typescript
// 使用 csvLoader 工具讀取 CSV 資料
import { loadMovies, loadHalls, loadScreenings } from '@/utils/csvLoader'

// 在組件中使用
const movies = loadMovies()
const halls = loadHalls()
const screenings = loadScreenings()
```

---

## 🎯 使用流程

1. **進入首頁** → 瀏覽大屏輪播
2. **選擇電影** → 點擊電影卡片或輪播圖
3. **選擇場次與座位 →** 在座位圖上點選想要的座位
4. **加入購物車** **→** 確認座位後，加入購物車
5. ****查看購物車** →** 檢查訂單詳情，可編輯或刪除
6. ****結帳付款** →** 確認訂單，完成付款流程
7. ****查看訂單** → **獲得訂單編號，可查看歷史記錄

---

## 🛠️ 開發工具

### 核心

- **React 18**: 前端框架
- **TypeScript**: 型別安全的 JavaScript
- **Vite**: 建置工具

### 設計工具

- **Tailwind CSS**: CSS 框架，快速樣式開發
- **Framer Motion**
- **Lucide React**

### 資料處理

- **讀取CSV**: 直接讀取 Excel 格式的 CSV 檔案
- **快取**: 避免重複讀取資料檔案

---

**CHCCCinema 電影訂票系統** - 為您提供最專業的線上購票體驗！✨
