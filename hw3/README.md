# 🎬 Cinema Booking System

電影院訂票與選位系統 - 純前端網頁服務

完整的電影訂票系統，支援電影瀏覽、場次選擇、座位劃位、購物車管理、訂單結帳與歷史記錄查詢。

## ✨ 主要功能

### 🎥 電影瀏覽
- 瀏覽 10 部上映電影
- 即時搜尋（片名、類型、年份）
- 響應式電影卡片展示
- 完整電影資訊（海報、類型、分級、簡介）

### 📅 場次選擇
- 按日期分組顯示場次
- 多種格式（2D/3D/IMAX）
- 完整場次資訊（時間、影廳、價格）
- 視覺化選中效果（ring 高亮）
- 底部固定欄顯示已選場次

### 🪑 座位選擇
- 獨立頁面專注座位選擇
- 視覺化座位圖（三種廳型）
- 即時座位狀態（可選/已選/已售）
- 隨機已售座位模擬（10-15%）
- 即時價格計算
- 底部固定操作欄

### 🛒 購物車管理
- 多筆訂單管理
- **修改座位功能**（編輯模式）
- 刪除訂單
- 清空購物車
- 總金額統計
- 空購物車友善提示

### 💳 訂單結帳
- 訂單明細確認
- 訂單摘要（sticky）
- 送出訂單動畫
- **訂單自動儲存至 LocalStorage**
- 訂單成功確認（3秒自動跳轉）
- 返回購物車按鈕

### 📜 歷史訂單
- 查看所有歷史訂單
- 訂單編號與時間
- 完整訂單詳情
- LocalStorage 持久化
- 按時間倒序排列

### 📊 熱門電影統計
- 本週熱門電影 Top 3
- 票房統計（票數）
- 視覺化進度條
- 排名徽章（金銀銅）
- 點擊可跳轉電影詳情

### 🧭 導覽優化
- **Breadcrumb 麵包屑導覽**
- 顯示當前頁面路徑
- 可點擊返回上層
- 自動顯示電影名稱
- **重新載入資料按鈕**（CSV 熱重載）

## 🛣️ 路由結構

```
/                        → 首頁（含熱門電影統計）
/movies                  → 電影列表（含搜尋）
/movie/:id               → 電影詳情（場次選擇）
/movie/:id/select-seat   → 座位選擇（獨立頁面）
/cart                    → 購物車（可修改/刪除）
/checkout                → 結帳確認
/history                 → 歷史訂單
```

**Breadcrumb 導覽示例**：
- `/movies` → 首頁 > 電影列表
- `/movie/1001` → 首頁 > 電影列表 > Skydrift
- `/movie/1001/select-seat` → 首頁 > 電影列表 > Skydrift > 選擇座位
- `/checkout` → 首頁 > 購物車 > 結帳

## 🎯 使用流程

### 完整訂票流程
```
1. 首頁 → 查看熱門電影統計
2. 瀏覽電影列表（可搜尋）
3. 查看電影詳情
4. 點擊場次卡片選中（視覺回饋）
5. 點擊「選擇座位」按鈕
6. 進入座位選擇頁面
7. 選擇座位（可多選）
8. 加入購物車（成功提示）
9. 查看購物車（可修改/刪除）
10. 前往結帳
11. 確認訂單並送出
12. 訂單成功（自動儲存至 LocalStorage）
13. 3 秒後跳轉歷史訂單 ✅
14. 首頁熱門統計自動更新
```

### 修改訂單
```
1. 購物車 → 點擊「修改」按鈕
2. 座位選擇頁面（編輯模式）
3. 原座位自動預載（藍色高亮）
4. 修改座位選擇
5. 點擊「更新購物車」
6. 顯示成功訊息
7. 返回購物車（座位已更新）
```

### 重新載入資料
```
1. 點擊導覽列的「↻」按鈕
2. 自動重新載入 CSV 資料
3. 更新電影、場次、影廳資訊
4. 不需重新整理頁面
```

## 🗂️ 專案結構

```
hw3/
├── public/
│   └── data/
│       ├── movies.csv          # 10 部電影
│       ├── halls.csv           # 3 個影廳
│       └── screenings.csv      # 168 個場次
├── src/
│   ├── components/
│   │   ├── ui/                 # Shadcn UI 組件
│   │   ├── Navbar.tsx          # 導覽列
│   │   ├── SeatMap.tsx         # 座位圖組件
│   │   └── PopularMovies.tsx   # 熱門電影統計
│   ├── pages/
│   │   ├── Home.tsx            # 首頁
│   │   ├── Movies.tsx          # 電影列表
│   │   ├── MovieDetail.tsx     # 電影詳情
│   │   ├── SeatSelection.tsx   # 座位選擇
│   │   ├── Cart.tsx            # 購物車
│   │   ├── Checkout.tsx        # 結帳
│   │   └── History.tsx         # 歷史訂單
│   ├── context/
│   │   └── MovieContext.tsx    # 狀態管理
│   ├── hooks/
│   │   └── useSoldSeats.ts     # 座位生成 Hook
│   ├── utils/
│   │   └── csvLoader.ts        # CSV 載入工具
│   ├── lib/
│   │   └── utils.ts            # 工具函數
│   ├── App.tsx                 # 主應用（路由配置）
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全域樣式
└── 配置文件
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── .gitignore
```

## 🚀 安裝與執行

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
訪問：`http://localhost:5173`

### 建構專案
```bash
npm run build
```

### 預覽建構結果
```bash
npm run preview
```

## 💻 技術棧

### 核心技術
- **React 18** - UI 框架
- **TypeScript** - 型別安全
- **Vite** - 快速建構工具
- **React Router v6** - 路由管理

### UI/樣式
- **TailwindCSS** - CSS 框架
- **Shadcn UI** - UI 組件庫
- **Lucide Icons** - 圖示庫

### 資料處理
- **PapaCSV** - CSV 解析
- **Context API** - 狀態管理
- **LocalStorage** - 訂單持久化

## 🎨 特色功能

### 座位選擇系統
- 三種影廳大小（120/80/200 座位）
- 座位狀態視覺化（可選/已選/已售）
- 隨機已售座位生成
- 即時價格計算

### 購物車功能
- 多筆訂單管理
- 修改座位（編輯模式）
- 刪除訂單
- 總金額統計

### 訂單系統
- 訂單送出與確認
- LocalStorage 持久化
- 歷史訂單查詢
- 訂單編號生成

### 統計功能
- 熱門電影 Top 3
- 票數統計
- 視覺化進度條

## 📊 資料結構

### 電影 (movies.csv)
```csv
movie_id, title, year, genres, runtime_min, audio_language, 
age_rating_tw, poster_url, synopsis
```

### 影廳 (halls.csv)
```csv
hall_id, hall_name, capacity, seatmap_id
```

### 場次 (screenings.csv)
```csv
screening_id, date, start_time, end_time, hall_id, movie_id, 
format, audio_language, subtitle_language, price_TWD
```

### 訂單 (localStorage)
```typescript
{
  orderId: string        // 訂單編號
  timestamp: string      // 訂購時間
  items: CartItem[]      // 訂單項目
  total: number          // 總金額
}
```

## 🎯 開發說明

### Context 使用
```typescript
const {
  movies,
  cart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = useMovieContext()
```

### CSV 載入
```typescript
import { loadCSV } from '@/utils/csvLoader'
const movies = await loadCSV<Movie>('/data/movies.csv')
```

### LocalStorage 操作
```typescript
// 儲存訂單
const orders = JSON.parse(localStorage.getItem('cinema_orders') || '[]')
orders.push(newOrder)
localStorage.setItem('cinema_orders', JSON.stringify(orders))

// 讀取訂單
const savedOrders = localStorage.getItem('cinema_orders')
const orders = savedOrders ? JSON.parse(savedOrders) : []
```

## 📱 響應式設計

- **手機 (< 640px)**: 1 列布局
- **平板 (640px - 1024px)**: 2 列布局
- **筆電 (1024px - 1280px)**: 3 列布局
- **桌機 (> 1280px)**: 4 列布局

## 🎨 UI 組件

### Shadcn UI 組件
- Button - 按鈕
- Card - 卡片
- Badge - 標籤
- Input - 輸入框
- Skeleton - 載入動畫
- Alert - 提示訊息

### 自定義組件
- SeatMap - 座位圖組件
- PopularMovies - 熱門電影統計
- Breadcrumb - 麵包屑導覽
- Navbar - 導覽列（含重新載入按鈕）

## 📈 功能特色

### UX 優化
- ✅ **清晰的三步驟流程**（選電影 → 選場次 → 選座位）
- ✅ **Breadcrumb 導覽**（顯示當前位置與路徑）
- ✅ 即時視覺回饋（ring 高亮、動畫效果）
- ✅ 流暢的頁面導航
- ✅ 完善的錯誤處理與空狀態提示
- ✅ 修改訂單成功訊息
- ✅ 底部固定操作欄（選場次、選座位）

### 技術特色
- ✅ TypeScript 型別安全（無錯誤）
- ✅ Context API 狀態管理
- ✅ **LocalStorage 資料持久化**（訂單記錄）
- ✅ **CSV 熱重載**（手動重新載入）
- ✅ 響應式設計（手機/平板/桌機）
- ✅ State 傳遞機制（location.state）
- ✅ 防呆設計（缺少資料自動導回）

### 視覺設計
- ✅ 現代化 UI 設計（Shadcn UI）
- ✅ 流暢的動畫效果
- ✅ 清晰的色彩系統
- ✅ 完整的視覺回饋（hover、選中、成功）
- ✅ 排名徽章（金銀銅）
- ✅ 進度條視覺化

## 🐛 常見問題

### Q: CSV 檔案載入失敗？
A: 確認檔案位於 `public/data/` 目錄下

### Q: 訂單資料消失？
A: 檢查瀏覽器 LocalStorage 是否被清除

### Q: 座位圖不顯示？
A: 確認已選擇場次並正確傳遞 state

### Q: 熱門電影不顯示？
A: 需要先完成至少一筆訂單才會有統計資料

## 📝 版本資訊

**版本**: 2.0.0
**狀態**: Production Ready
**最後更新**: 2025/10/08

## 🎯 功能完成度

- ✅ 電影瀏覽與搜尋
- ✅ 場次選擇（視覺化選中）
- ✅ 座位選擇（獨立頁面、視覺化）
- ✅ 購物車管理（可修改/刪除）
- ✅ 訂單結帳（自動儲存）
- ✅ 歷史訂單（持久化查詢）
- ✅ 熱門電影統計（Top 3）
- ✅ Breadcrumb 導覽
- ✅ CSV 熱重載
- ✅ 響應式設計
- ✅ LocalStorage 持久化
- ✅ UX 流程優化
- ✅ 成功訊息提示
- ✅ 空狀態友善提示

**總完成度**: 100% ✨

## 📚 更多資訊

### 測試建議
1. ✅ 完成一次完整訂票流程
2. ✅ 測試修改購物車功能（座位更新）
3. ✅ 查看歷史訂單（LocalStorage）
4. ✅ 觀察熱門電影統計更新
5. ✅ 測試 Breadcrumb 導覽
6. ✅ 測試重新載入資料功能
7. ✅ 測試空購物車提示

### 開發建議
- 使用 `@/` 作為 `src/` 的別名
- 所有 UI 組件在 `src/components/ui/`
- 使用 `cn()` 函數合併 className
- CSV 透過 `loadCSV` 函數載入
- 使用 `useMovieContext()` 存取全域狀態
- 使用 `location.state` 傳遞頁面資料

### 優化重點
- **場次與座位分離** - 清晰的兩步驟流程
- **獨立座位頁面** - 專注的選座體驗
- **可編輯購物車** - 彈性的訂單管理
- **資料持久化** - 訂單記錄永久保存
- **熱門統計** - 即時票房數據
- **麵包屑導覽** - 清晰的位置指引

## 🎊 專案亮點

- 🎬 **完整訂票系統** - 從瀏覽到結帳一氣呵成
- 🪑 **視覺化座位圖** - 三種廳型完整支援，即時狀態顯示
- 🔄 **可編輯購物車** - 靈活的訂單管理，支援修改座位
- 📊 **統計功能** - 熱門電影 Top 3，票房即時更新
- 💾 **資料持久化** - LocalStorage 儲存訂單記錄
- 📱 **響應式設計** - 完美適配各種裝置
- 🧭 **Breadcrumb 導覽** - 清晰的頁面路徑指引
- 🔄 **CSV 熱重載** - 手動重新載入資料功能
- ✨ **優質 UX** - 清晰流程、視覺回饋、成功提示
- 🎯 **防呆設計** - 資料驗證、自動導航、錯誤處理

## 👨‍💻 作者

網路服務程式設計課程作業

## 📄 授權

此專案為教學用途。

