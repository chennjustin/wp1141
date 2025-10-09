# 🎬 Cinema Booking System

專業電影院訂票與選位系統 - 全功能前端網頁應用程式

完整的電影訂票系統，支援電影瀏覽、場次選擇、座位劃位、購物車管理、訂單結帳與歷史記錄查詢。全新重新設計的首頁，打造真實電影院官網的專業視覺體驗。

---

## 🌟 專案亮點

- 🎬 **真實電影院官網風格** - 全螢幕 Hero 輪播、動態卡片、專業視覺設計
- 🎨 **精緻動畫系統** - Framer Motion 驅動的流暢動畫與視差滾動效果
- 🪑 **視覺化座位圖** - 三種廳型完整支援，即時狀態顯示
- 🔄 **可編輯購物車** - 靈活的訂單管理，支援修改座位
- 📊 **統計功能** - 熱門電影 Top 3，票房即時更新
- 💾 **資料持久化** - LocalStorage 儲存訂單記錄
- 📱 **完整響應式設計** - 完美適配手機、平板、桌機
- 🧭 **Breadcrumb 導覽** - 清晰的頁面路徑指引
- ✨ **優質使用者體驗** - 清晰流程、視覺回饋、成功提示

---

## 🎥 全新首頁設計

### Hero 區塊（80vh 全螢幕）

#### 視覺特色
- **全螢幕輪播** - 高度 80vh，佔滿整個螢幕寬度
- **電影海報背景** - 搭配 Ken Burns 效果（8秒緩慢放大）
- **四層漸層遮罩** - 確保文字在任何背景下都清晰可讀
- **專業文字投影** - 多層陰影打造電影感
- **大字級標題** - 4xl-6xl 響應式字級，戲劇化效果

#### 互動功能
- **自動輪播** - 每 5 秒自動切換電影
- **左右箭頭** - 手動切換，hover 時發光效果
- **圓點導航** - 跳轉到指定電影
- **自動播放進度條** - 底部紅色漸層條實時顯示進度
- **暫停/播放按鈕** - 右下角控制按鈕
- **滑鼠懸停暫停** - 懸停在 Hero 上自動暫停播放
- **視差滾動** - Hero 隨頁面滾動淡出並縮小

#### 動畫效果
```
文字逐層浮入：
  ├─ 標題：delay 0.3s
  ├─ 年份片長：delay 0.5s
  ├─ 類型標籤：delay 0.65s
  └─ 行動按鈕：delay 0.85s

Hero 切換：淡入淡出 + 縮放（0.7秒）
進度條：0% → 100%（5秒線性動畫）
```

### 本週熱映區塊

#### 卡片設計
- **尺寸** - 寬 52-60（響應式），高 80-88
- **圓角** - rounded-2xl 現代感
- **底部漸層** - 常駐顯示片名和基本資訊

#### 懸浮效果
- **向上浮起** - y: -10px
- **微縮放** - scale: 1.03
- **圖片放大** - 內部圖片放大至 110%
- **陰影加深** - shadow-xl → shadow-2xl
- **詳細資訊** - 向上滑入顯示標籤和「立即訂票」按鈕

#### 進場動畫
- **滾動觸發** - whileInView，滾動至可見時觸發
- **淡入向上** - opacity 0→1, y 30→0
- **逐張延遲** - 每張卡片 delay 0.1s

### 即將上映區塊

#### 視覺區隔
- **漸層背景** - from-gray-50 to-white
- **藍色主題** - 藍色裝飾線和按鈕
- **「即將上映」標籤** - 黃橙色漸層 + 脈衝動畫
- **相同卡片效果** - 與熱映區相同的懸浮動畫

### 使用教學彈窗

#### 視覺設計
- **中央大視覺彈窗** - max-w-4xl
- **整頁背景模糊** - backdrop-blur-md + bg-black/60
- **白色半透明背景** - bg-white/95 + backdrop-blur-xl
- **彩色裝飾條** - 頂部藍→紫→粉漸層

#### 內容結構
- **大型 Sparkles 圖示** - 彈簧動畫
- **標題 3xl-5xl** - 響應式大字級
- **三個步驟卡片** - 彩色漸層背景（藍、紫、綠）
- **紅色漸層按鈕** - 「我了解了，開始使用」

#### 動畫時序
```
彈窗整體：0s（scale 0.9 → 1）
圖示：0.2s（彈簧動畫）
標題：0.3s
步驟卡片：0.5s、0.65s、0.8s
按鈕：1.2s
```

### Footer 區塊

#### 3欄式佈局
- **品牌區** - 紅色漸層 Logo + 簡介
- **快速連結** - 電影列表、購物車、訂票記錄、使用教學
- **聯絡資訊** - 客服專線、Email、社群連結（Facebook、Instagram、YouTube）

#### 設計風格
- **深色背景** - from-gray-900 to-black 漸層
- **進入動畫** - whileInView 淡入
- **版權聲明** - 底部居中

---

## ✨ 核心功能

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
- 視覺化座位圖（三種廳型：120/80/200座位）
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

---

## 🎨 視覺設計系統

### 主色調
```css
背景色：#f9fafb (gray-50) - 淺灰白
主要按鈕：#dc2626 → #b91c1c (red-600 → red-700) - 電影紅
次要按鈕：rgba(255,255,255,0.1) - 半透明白
強調色：
  - 本週熱映：紅色系
  - 即將上映：藍色系
  - 標籤：黃橙色系
```

### 字級系統
```css
Hero 標題：text-4xl sm:text-5xl lg:text-6xl
區塊標題：text-3xl sm:text-4xl lg:text-5xl
卡片標題：text-lg sm:text-xl
次要資訊：text-sm sm:text-base
```

### 陰影系統
```css
文字投影：
  - 標題：0 4px 20px rgba(0,0,0,0.8)
  - 子標：0 2px 10px rgba(0,0,0,0.7)
  - 標籤：0 1px 3px rgba(0,0,0,0.5)

卡片陰影：
  - 預設：shadow-xl
  - 懸浮：shadow-2xl
  - 按鈕：shadow-lg hover:shadow-red-500/50
```

### 動畫時序
```
Hero 輪播：5秒/張，0.7秒切換動畫
文字浮入：逐層 delay（0.3s-0.85s）
卡片懸浮：0.5秒平滑過渡
圖片放大：0.7秒緩慢放大
進度條：每 50ms 更新
```

---

## 🛣️ 路由結構

```
/                        → 首頁（全新設計：Hero + 熱映 + 即將上映 + Footer）
/movies                  → 電影列表（含搜尋）
/movie/:id               → 電影詳情（場次選擇）
/movie/:id/select-seat   → 座位選擇（獨立頁面）
/cart                    → 購物車（可修改/刪除）
/checkout                → 結帳確認
/history                 → 歷史訂單
```

**Breadcrumb 導覽範例**：
- `/movies` → 首頁 > 電影列表
- `/movie/1001` → 首頁 > 電影列表 > Skydrift
- `/movie/1001/select-seat` → 首頁 > 電影列表 > Skydrift > 選擇座位
- `/checkout` → 首頁 > 購物車 > 結帳

---

## 🎯 使用流程

### 完整訂票流程
```
1. 首頁 → 查看 Hero 輪播與熱門電影
2. 點擊「立即訂票」或瀏覽電影列表（可搜尋）
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

### 首頁互動
```
Hero 區塊：
  - 滑鼠懸停：暫停自動播放
  - 左右箭頭：手動切換電影
  - 圓點：跳轉到指定電影
  - 右下角按鈕：暫停/播放切換
  - 底部進度條：實時顯示播放進度

電影卡片：
  - 懸浮：顯示詳細資訊和按鈕
  - 點擊卡片：跳轉到電影詳情
  - 點擊按鈕：直接訂票
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

---

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
│   │   ├── common/             # 共用組件（AppModal、Marquee、RatingIcon）
│   │   ├── feedback/           # 回饋組件（Toaster、Modal）
│   │   ├── guide/              # 使用教學組件
│   │   ├── home/               # 首頁專用組件（HeroCarousel、QuickActions）
│   │   ├── movies/             # 電影相關組件（MovieRow、TagChip）
│   │   ├── Navbar.tsx          # 導覽列
│   │   ├── Breadcrumb.tsx      # 麵包屑導覽
│   │   └── SeatMap.tsx         # 座位圖組件
│   ├── pages/
│   │   ├── Home.tsx            # 首頁（全新設計，672行）
│   │   ├── Movies.tsx          # 電影列表
│   │   ├── MovieDetail.tsx     # 電影詳情
│   │   ├── SeatSelection.tsx   # 座位選擇
│   │   ├── Cart.tsx            # 購物車
│   │   ├── Checkout.tsx        # 結帳
│   │   └── History.tsx         # 歷史訂單
│   ├── context/
│   │   ├── MovieContext.tsx    # 電影狀態管理
│   │   └── ModalContext.tsx    # 彈窗狀態管理
│   ├── hooks/
│   │   ├── useSoldSeats.ts     # 座位生成 Hook
│   │   └── useAddToCartToast.tsx # 購物車提示 Hook
│   ├── utils/
│   │   └── csvLoader.ts        # CSV 載入工具
│   ├── lib/
│   │   └── utils.ts            # 工具函式
│   ├── App.tsx                 # 主應用（路由配置）
│   ├── main.tsx                # 入口檔案
│   └── index.css               # 全域樣式
└── 配置檔案
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── tsconfig.node.json
```

---

## 🚀 安裝與執行

### 環境需求
- Node.js 16+
- npm 或 yarn

### 安裝相依套件
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
瀏覽器開啟：`http://localhost:5173`

### 建置專案
```bash
npm run build
```

### 預覽建置結果
```bash
npm run preview
```

---

## 💻 技術棧

### 核心技術
- **React 18** - UI 框架
- **TypeScript** - 型別安全
- **Vite** - 快速建置工具
- **React Router v6** - 路由管理

### UI/樣式
- **TailwindCSS 3** - CSS 框架
- **Shadcn UI** - UI 組件庫
- **Lucide Icons** - 圖示庫
- **Framer Motion** - 動畫框架

### 資料處理
- **PapaCSV** - CSV 解析
- **Context API** - 狀態管理
- **LocalStorage** - 訂單持久化

---

## 📊 資料結構

### 電影 (movies.csv)
```csv
movie_id, title, year, genres, runtime_min, audio_language, 
age_rating_tw, poster_url, synopsis
```
**共 10 部電影**

### 影廳 (halls.csv)
```csv
hall_id, hall_name, capacity, seatmap_id
```
**3 個影廳**：
- A廳：120 座位（seatmap_1）
- B廳：80 座位（seatmap_2）
- C廳：200 座位（seatmap_3）

### 場次 (screenings.csv)
```csv
screening_id, date, start_time, end_time, hall_id, movie_id, 
format, audio_language, subtitle_language, price_TWD
```
**共 168 個場次**（跨 7 天，多種格式）

### 訂單 (localStorage)
```typescript
{
  orderId: string        // 訂單編號（格式：ORDER-timestamp）
  timestamp: string      // 訂購時間（ISO 8601）
  items: CartItem[]      // 訂單項目
  total: number          // 總金額（新台幣）
}
```

---

## 🎯 開發說明

### Context 使用
```typescript
// 電影 Context
const {
  movies,          // 電影列表
  halls,           // 影廳列表
  screenings,      // 場次列表
  cart,            // 購物車
  loading,         // 載入狀態
  addToCart,       // 加入購物車
  updateCartItem,  // 更新購物車項目
  removeFromCart,  // 移除購物車項目
  clearCart,       // 清空購物車
  reloadData,      // 重新載入 CSV
} = useMovieContext()

// 彈窗 Context
const {
  isOpen,          // 彈窗開啟狀態
  content,         // 彈窗內容
  openUsageGuide,  // 開啟使用教學
  closeModal,      // 關閉彈窗
  openModal,       // 開啟自訂彈窗
} = useModal()
```

### CSV 載入
```typescript
import { loadCSV } from '@/utils/csvLoader'

const movies = await loadCSV<Movie>('/data/movies.csv')
const halls = await loadCSV<Hall>('/data/halls.csv')
const screenings = await loadCSV<Screening>('/data/screenings.csv')
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

// 使用教學狀態
localStorage.setItem('cbx_seen_guide', '1')
const hasSeenGuide = localStorage.getItem('cbx_seen_guide')
```

### 動畫實作
```typescript
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

// 基本動畫
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  內容
</motion.div>

// 滾動觸發動畫
<motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6 }}
>
  內容
</motion.div>

// 懸浮動畫
<motion.div
  whileHover={{ y: -10, scale: 1.03 }}
  transition={{ duration: 0.3 }}
>
  內容
</motion.div>

// 視差滾動
const { scrollY } = useScroll()
const opacity = useTransform(scrollY, [0, 300], [1, 0.3])
const scale = useTransform(scrollY, [0, 300], [1, 0.95])

<motion.div style={{ opacity, scale }}>
  內容
</motion.div>
```

---

## 📱 響應式設計

### 斷點系統
- **手機 (< 640px)**: 1 列佈局
- **平板 (640px - 1024px)**: 2 列佈局
- **筆電 (1024px - 1280px)**: 3 列佈局
- **桌機 (> 1280px)**: 4 列佈局

### 首頁響應式
```css
/* Hero 標題 */
text-4xl sm:text-5xl lg:text-6xl

/* 區塊標題 */
text-3xl sm:text-4xl lg:text-5xl

/* 電影卡片 */
w-52 sm:w-60          /* 寬度 */
h-80 sm:h-[22rem]     /* 高度 */

/* 間距 */
py-16 sm:py-20 lg:py-24    /* 垂直間距 */
px-4 sm:px-6 lg:px-8       /* 水平間距 */
gap-5 sm:gap-6             /* 卡片間距 */
```

---

## 🎨 UI 組件

### Shadcn UI 組件
- **Button** - 按鈕（多種樣式）
- **Card** - 卡片容器
- **Badge** - 標籤徽章
- **Input** - 輸入框
- **Skeleton** - 載入動畫
- **Alert** - 提示訊息
- **Toast** - 彈出通知

### 自訂組件
- **SeatMap** - 座位圖組件（三種廳型）
- **HeroCarousel** - Hero 輪播（已整合至 Home.tsx）
- **UsageGuide** - 使用教學彈窗
- **AppModal** - 通用彈窗容器
- **Breadcrumb** - 麵包屑導覽
- **Navbar** - 導覽列（含購物車徽章）
- **Toaster** - Toast 通知容器

---

## 🐛 常見問題

### Q: CSV 檔案載入失敗？
**A**: 確認檔案位於 `public/data/` 目錄下，且檔案名稱正確。

### Q: 訂單資料消失？
**A**: 檢查瀏覽器 LocalStorage 是否被清除。可在開發者工具的 Application > Local Storage 中查看。

### Q: 座位圖不顯示？
**A**: 確認已選擇場次並正確傳遞 state。檢查 `location.state` 是否包含 `screening`、`movie`、`hall` 資料。

### Q: 熱門電影不顯示？
**A**: 需要先完成至少一筆訂單才會有統計資料。統計資料來自 LocalStorage 的 `cinema_orders`。

### Q: Hero 輪播不會自動播放？
**A**: 檢查是否有滑鼠懸停在 Hero 區域上，或者右下角的暫停按鈕是否被點擊。

### Q: 動畫不順暢？
**A**: 確認已正確安裝 `framer-motion`：
```bash
npm install framer-motion
```

### Q: 首頁沒有佔滿整個螢幕？
**A**: 確認 `App.tsx` 中首頁路由沒有被 `container` 包裹。首頁需要完整寬度才能顯示 Hero。

---

## 📈 功能特色

### UX 優化
- ✅ 真實電影院官網風格的首頁設計
- ✅ 全螢幕 Hero 輪播與自動播放進度條
- ✅ 流暢的動畫過渡與視差滾動效果
- ✅ 清晰的三步驟訂票流程（選電影 → 選場次 → 選座位）
- ✅ Breadcrumb 導覽（顯示當前位置與路徑）
- ✅ 即時視覺回饋（ring 高亮、動畫效果）
- ✅ 完善的錯誤處理與空狀態提示
- ✅ 修改訂單成功訊息
- ✅ 底部固定操作欄（選場次、選座位）

### 技術特色
- ✅ TypeScript 型別安全（無錯誤）
- ✅ Framer Motion 動畫系統
- ✅ Context API 狀態管理
- ✅ LocalStorage 資料持久化（訂單記錄）
- ✅ CSV 熱重載（手動重新載入）
- ✅ 完整響應式設計（手機/平板/桌機）
- ✅ State 傳遞機制（location.state）
- ✅ 防呆設計（資料驗證、自動導航、錯誤處理）

### 視覺設計
- ✅ 專業電影院配色（深灰黑 + 電影紅）
- ✅ 現代化 UI 設計（Shadcn UI）
- ✅ 流暢的動畫效果（Framer Motion）
- ✅ 多層漸層遮罩系統
- ✅ 清晰的色彩系統與視覺層次
- ✅ 完整的視覺回饋（hover、選中、成功）
- ✅ 排名徽章（金銀銅）
- ✅ 進度條視覺化

---

## 📝 版本資訊

**版本**: 3.0.0  
**狀態**: Production Ready  
**最後更新**: 2025/10/09

### 更新日誌

#### v3.0.0 (2025/10/09)
- 🎨 全新首頁設計（Hero + 熱映 + 即將上映 + Footer）
- ✨ 加入 Framer Motion 動畫系統
- 🎬 80vh 全螢幕 Hero 輪播
- ⏸️ 暫停/播放控制與自動進度條
- 🎯 視差滾動效果
- 🃏 電影卡片懸浮動畫優化
- 📘 使用教學彈窗重新設計
- 🦶 新增 Footer 區塊

#### v2.0.0 (2025/10/08)
- 📊 熱門電影統計功能
- 🧭 Breadcrumb 麵包屑導覽
- 🔄 CSV 熱重載功能
- 💾 訂單持久化至 LocalStorage
- 🛒 購物車修改座位功能
- ✨ UX 流程優化

#### v1.0.0 (2025/10/07)
- 🎬 基本訂票系統功能
- 🪑 座位選擇系統
- 🛒 購物車與結帳功能

---

## 🎯 功能完成度

### 核心功能
- ✅ 電影瀏覽與搜尋
- ✅ 場次選擇（視覺化選中）
- ✅ 座位選擇（獨立頁面、視覺化）
- ✅ 購物車管理（可修改/刪除）
- ✅ 訂單結帳（自動儲存）
- ✅ 歷史訂單（持久化查詢）
- ✅ 熱門電影統計（Top 3）

### 導覽與UX
- ✅ Breadcrumb 導覽
- ✅ CSV 熱重載
- ✅ 響應式設計
- ✅ LocalStorage 持久化
- ✅ UX 流程優化
- ✅ 成功訊息提示
- ✅ 空狀態友善提示

### 首頁設計（v3.0）
- ✅ 全螢幕 Hero 輪播（80vh）
- ✅ 四層漸層遮罩系統
- ✅ Ken Burns 效果
- ✅ 文字逐層浮入動畫
- ✅ 自動播放進度條
- ✅ 暫停/播放控制
- ✅ 視差滾動效果
- ✅ 本週熱映區塊
- ✅ 即將上映區塊
- ✅ 電影卡片懸浮動畫
- ✅ 滾動觸發動畫（whileInView）
- ✅ 使用教學大視覺彈窗
- ✅ Footer 區塊

**總完成度**: 100% ✨

---

## 📚 測試建議

### 基本功能測試
1. ✅ 完成一次完整訂票流程
2. ✅ 測試修改購物車功能（座位更新）
3. ✅ 查看歷史訂單（LocalStorage）
4. ✅ 觀察熱門電影統計更新
5. ✅ 測試 Breadcrumb 導覽
6. ✅ 測試重新載入資料功能
7. ✅ 測試空購物車提示

### 首頁互動測試
1. ✅ Hero 自動輪播（5秒切換）
2. ✅ 滑鼠懸停暫停功能
3. ✅ 左右箭頭手動切換
4. ✅ 圓點導航跳轉
5. ✅ 暫停/播放按鈕
6. ✅ 進度條實時更新
7. ✅ 視差滾動效果
8. ✅ 電影卡片懸浮動畫
9. ✅ 滾動觸發進場動畫
10. ✅ 首次進站彈窗
11. ✅ 所有連結與按鈕功能

### 響應式測試
1. ✅ 手機版面（< 640px）
2. ✅ 平板版面（640px - 1024px）
3. ✅ 桌機版面（> 1024px）
4. ✅ 各尺寸的文字可讀性
5. ✅ 觸控裝置的操作體驗

---

## 💡 開發建議

### 程式碼規範
- 使用 `@/` 作為 `src/` 的別名
- 所有 UI 組件放在 `src/components/ui/`
- 使用 `cn()` 函式合併 className
- CSV 透過 `loadCSV` 函式載入
- 使用 `useMovieContext()` 存取全域狀態
- 使用 `location.state` 傳遞頁面資料

### 動畫最佳實踐
- 使用 `transform` 而非 `position`（GPU 加速）
- 使用 `opacity` 漸變（高效能）
- 滾動動畫使用 `viewport={{ once: true }}`（只觸發一次）
- 避免觸發 reflow 的屬性

### 效能優化
- 圖片使用 `object-cover` 確保比例
- 考慮圖片壓縮與 CDN
- 大量電影時考慮 lazy loading
- 使用 React.memo 避免不必要的重新渲染

---

## 🎊 專案總結

這是一個功能完整、視覺精緻的電影訂票系統，特色包括：

### 🎬 真實電影院體驗
- 專業的 Hero 輪播設計
- 電影感的視覺效果
- 流暢的動畫過渡
- 完整的互動回饋

### 🛠️ 完整的訂票功能
- 從瀏覽到結帳一氣呵成
- 視覺化的座位選擇
- 靈活的購物車管理
- 持久化的訂單記錄

### 🎨 精緻的視覺設計
- 現代化的 UI 設計
- 統一的色彩系統
- 清晰的視覺層次
- 響應式的佈局

### ✨ 優質的使用者體驗
- 清晰的操作流程
- 即時的視覺回饋
- 友善的錯誤處理
- 流暢的頁面導航

---

## 👨‍💻 作者

網路服務程式設計課程作業

---

## 📄 授權

此專案為教學用途。
