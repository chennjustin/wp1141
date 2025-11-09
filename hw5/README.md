# my X

一個仿 Twitter/X 的社交媒體平台，使用 Next.js 14、Prisma、PostgreSQL、NextAuth 、Pusher 、Cloudinary 打造。

## Deployed Link

**Deployed Link:** **https://myxclone.vercel.app**

---

## 功能清單

### 使用者認證與註冊

- **多種登入方式**

  - Google OAuth 登入
  - GitHub OAuth 登入
  - Facebook OAuth 登入（待開發）
  - UserID 快速登入
- **使用者註冊**

  - 註冊新帳號
  - 設定 UserID（唯一識別碼）
  - 設定顯示名稱
- **個人資料管理**

  - 編輯個人資料（名稱、簡介）
  - 上傳頭像（Avatar）
  - 上傳封面圖片（Cover Image）
  - 查看個人檔案頁面

### 📝 貼文功能

- **發文**

  - Inline Posting：在主頁直接發文
  - Modal Posting：點擊側邊欄「Post」按鈕開啟發文視窗
  - 文字內容（最多 280 字元）
  - 圖片上傳（使用 Cloudinary）
  - 計數顯示
  - 即時發布
- **@ 提及功能**

  - 輸入 `@` 自動顯示候選使用者列表
  - 優先顯示已追蹤的使用者，按字母順序排序
  - 被提及的使用者會收到通知
  - 提及內容會顯示為可點擊的連結
- **草稿功能**

  - 自動儲存未完成的貼文
  - 可從草稿繼續編輯
  - 僅在主發文視窗支援（回覆沒有）

### 💬 留言與互動

- **留言功能**

  - 對貼文或留言進行回覆
  - 遞迴留言結構
  - 留言也會顯示在主要貼文列表中
  - 留言支援 @ 提及功能
  - 留言可以被按讚、轉發
- **按讚功能**

  - 點擊愛心圖示切換按讚狀態
  - 按讚後愛心變為紅色
  - 顯示按讚數量
  - 即時更新按讚狀態（Pusher）
- **轉發功能（Repost）**

  - 轉發貼文到個人動態
  - 顯示轉發數量
  - 轉發的貼文會顯示「You reposted」標籤
  - 轉發的貼文無法刪除（只能取消轉發）
  - 即時更新轉發狀態
- **貼文刪除**

  - 作者可以透過右上角「...」選單刪除自己的貼文
  - 轉發的貼文無法刪除

### 📱 動態牆（Feed）

- **For You 動態**

  - 顯示所有用戶的貼文
  - 按時間排序（最新的在前）
  - 即時更新新貼文
- **Following 動態**

  - 僅顯示已追蹤用戶的貼文
  - 切換標籤即可切換動態類型
  - 即時更新
- **貼文顯示**

  - 作者頭像
  - 作者名稱與 UserID
  - 發文時間（幾秒前、幾分鐘前、幾小時前、幾天前）
  - 完整內容顯示
  - 互動統計（留言數、轉發數、按讚數）
  - 可點擊互動按鈕進行操作
  - 顯示留言列表（遞迴結構）

### 👤 個人檔案

- **個人檔案頁面**

  - 顯示使用者資訊（名稱、UserID、簡介）
  - 顯示頭像與封面圖片
  - 顯示追蹤者與追蹤中數量
  - 顯示使用者的貼文列表
  - 顯示使用者按讚的貼文（Likes）
  - 編輯個人資料按鈕（僅限自己的檔案）
- **追蹤功能**

  - 追蹤/取消追蹤其他使用者
  - 顯示追蹤狀態，且即時更新追蹤數量
- **追蹤者與追蹤中列表**

  - 查看使用者的追蹤者列表和追蹤中列表
  - 可直接在列表中追蹤/取消追蹤
  - 從個人檔案頁面點擊數量會導向對應標籤

### 🔔 通知系統

- **通知類型**

  - 被追蹤通知（Follow）
  - 留言通知（Comment）
  - 按讚通知（Like）
  - 轉發通知（Repost）
  - 被提及通知（Mention）
- **通知功能**

  - 即時通知（使用 Pusher）
  - 未讀通知高亮顯示（藍色背景）
  - 直接標記已讀的功能（Mark read 按鈕）
  - 通知列表顯示發送者頭像、內容、時間
  - 點擊通知可導向相關貼文或個人檔案
  - 側邊欄顯示未讀通知數量（紅點）

### 📄 貼文詳情頁

- **遞迴瀏覽**

  - 點擊貼文進入詳情頁
  - 顯示貼文與所有留言
  - 點擊留言可進入該留言的詳情頁
  - 留言會變成主要顯示內容，下方顯示其回覆
  - 支援無限層級瀏覽

### 🎨 使用者介面

- **側邊欄（Sidebar）**

  - 導航選單（首頁、通知、個人檔案）
  - 大型「Post」按鈕
  - 未讀通知紅點提示
  - 登出按鈕
- **導航列（Navbar）**

  - 首頁：For You / Following 標籤切換
  - 個人檔案/通知頁：返回按鈕 + 標題
- **即時更新**

  - 使用 Pusher 進行即時通訊
  - 新貼文自動出現在動態牆
  - 互動（按讚、轉發、留言）即時更新
  - 通知即時推送

---

## 專案架構

### 技術棧

- **前端框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: PostgreSQL（部屬用 neon）
- **ORM**: Prisma
- **認證**: NextAuth.js
- **即時通訊**: Pusher
- **媒體儲存**: Cloudinary
- **部署**: Vercel

### 專案結構

```
hw5/
├── prisma/
│   ├── schema.prisma          # 資料庫 Schema 定義
│   └── migrations/            # 資料庫遷移記錄
├── public/
│   └── assets/                # 靜態資源
├── src/
│   ├── app/                   # Next.js App Router 頁面
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 認證相關 API
│   │   │   ├── post/          # 貼文相關 API
│   │   │   ├── comment/       # 留言相關 API
│   │   │   ├── like/          # 按讚相關 API
│   │   │   ├── repost/        # 轉發相關 API
│   │   │   ├── follow/        # 追蹤相關 API
│   │   │   ├── notification/ # 通知相關 API
│   │   │   ├── user/          # 用戶相關 API
│   │   │   ├── drafts/        # 草稿相關 API
│   │   │   └── upload/        # 上傳相關 API
│   │   ├── home/              # 首頁
│   │   ├── login/             # 登入頁
│   │   ├── register/          # 註冊頁
│   │   ├── profile/           # 個人檔案頁
│   │   ├── post/              # 貼文詳情頁
│   │   └── notifications/    # 通知頁
│   ├── components/            # React 元件
│   │   ├── AppLayout.tsx     # 應用程式佈局
│   │   ├── Sidebar.tsx        # 側邊欄
│   │   ├── Navbar.tsx         # 導航列
│   │   ├── HomeFeed.tsx       # 動態牆
│   │   ├── PostCard.tsx       # 貼文卡片
│   │   ├── PostDetailPage.tsx # 貼文詳情頁
│   │   ├── InlineComposer.tsx # 內聯發文器
│   │   ├── PostModal.tsx      # 發文彈窗
│   │   ├── ReplyModal.tsx     # 回覆彈窗
│   │   ├── ProfilePage.tsx    # 個人檔案頁
│   │   ├── ProfileConnectionsPage.tsx # 追蹤者/追蹤中頁面
│   │   ├── NotificationsPage.tsx # 通知頁
│   │   ├── MediaUploader.tsx  # 媒體上傳元件
│   │   └── ...
│   ├── lib/                   # 工具函數庫
│   │   ├── prisma.ts         # Prisma 客戶端
│   │   ├── auth.ts           # NextAuth 設定
│   │   ├── pusher/           # Pusher 設定
│   │   ├── serializers.ts    # 資料序列化
│   │   └── ...
│   └── types/                 # TypeScript 類型定義
│       ├── post.ts
│       ├── user.ts
│       └── ...
└── package.json
```

### 資料庫架構

```
User (用戶)
├── Account (OAuth 帳號)
├── Session (會話)
├── Post (貼文)
│   ├── Like (按讚)
│   ├── Repost (轉發)
│   └── Post (回覆/留言，遞迴關聯)
├── Follow (追蹤關係)
│   ├── followerId → User (追蹤者)
│   └── followingId → User (被追蹤者)
├── Notification (通知)
│   ├── senderId → User (發送者)
│   └── receiverId → User (接收者)
└── Draft (草稿)
```

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Next.js  │  │  React   │  │ Tailwind │              │
│  │   App    │  │Components │  │   CSS    │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │              │                     │
└───────┼─────────────┼──────────────┼─────────────────────┘
        │             │              │
        │  HTTP/REST  │              │  WebSocket
        │             │              │
┌───────▼─────────────▼──────────────▼─────────────────────┐
│              Next.js API Routes (Server)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ NextAuth │  │  Prisma  │  │  Pusher  │              │
│  │   Auth   │  │   ORM    │  │  Server  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │              │                     │
└───────┼─────────────┼──────────────┼─────────────────────┘
        │             │              │
        │             │              │
┌───────▼─────────────▼──────────────▼─────────────────────┐
│                    External Services                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │Cloudinary │  │  Pusher  │              │
│  │ Database │  │   Media   │  │ Channels │              │
│  └──────────┘  └───────────┘  └──────────┘              │
└───────────────────────────────────────────────────────────┘
```

### API 端點架構

```
/api/auth/[...nextauth]          # NextAuth 認證處理
/api/auth/provider-by-userid     # UserID 登入
/api/auth/recent-users           # 最近登入用戶列表

/api/post                        # 取得/建立貼文
/api/post/[id]                   # 取得/刪除特定貼文

/api/comment                     # 建立留言

/api/like                        # 切換按讚狀態

/api/repost                      # 切換轉發狀態

/api/follow                      # 切換追蹤狀態

/api/feed                        # 取得動態牆（支援 For You / Following）

/api/user/[id]                   # 取得用戶資訊
/api/user/[id]/followers         # 取得追蹤者列表
/api/user/[id]/following         # 取得追蹤中列表
/api/user/[id]/likes             # 取得用戶按讚的貼文
/api/user/mention-suggestions    # 取得 @ 提及建議

/api/notification                # 取得/標記通知

/api/drafts                      # 取得/建立/更新草稿
/api/drafts/[id]                 # 刪除草稿

/api/upload                      # 上傳媒體到 Cloudinary
```

### 資料流程

1. **發文流程**

   ```
   用戶輸入 → InlineComposer/PostModal
   → 解析 @ 提及 → 上傳媒體（如有）
   → POST /api/post → Prisma 建立 Post
   → Pusher 推送事件 → 所有客戶端更新
   → 建立提及通知 → Pusher 推送通知
   ```
2. **即時更新流程**

   ```
   用戶操作（按讚/轉發/留言）
   → API 更新資料庫
   → Pusher 推送事件
   → 所有訂閱的客戶端接收
   → 更新 UI（Optimistic Update）
   ```
3. **通知流程**

   ```
   事件發生（按讚/轉發/留言/追蹤/提及）
   → createNotification()
   → Prisma 建立 Notification
   → Pusher 推送通知事件
   → 接收者客戶端顯示通知
   → 側邊欄顯示紅點
   ```

---

## 本地開發

### 環境需求

- Node.js 18+
- PostgreSQL 資料庫
- npm 或 yarn

### 安裝步驟

1. **複製專案**

   ```bash
   git clone <repository-url>
   cd hw5
   ```
2. **安裝依賴**

   ```bash
   npm install
   ```
3. **設定環境變數**
   建立 `.env` 檔案，包含以下變數：

   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OAuth Providers
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GITHUB_ID="..."
   GITHUB_SECRET="..."
   FACEBOOK_CLIENT_ID="..."
   FACEBOOK_CLIENT_SECRET="..."

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."

   # Pusher
   PUSHER_APP_ID="..."
   PUSHER_KEY="..."
   PUSHER_SECRET="..."
   PUSHER_CLUSTER="..."
   ```
4. **初始化資料庫**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
5. **啟動開發伺服器**

   ```bash
   npm run dev
   ```
6. **開啟瀏覽器**
   訪問 http://localhost:3000

---

## 開發筆記

### 主要特色

- **Optimistic UI Updates**: 所有互動操作都採用樂觀更新，提供流暢的使用者體驗
- **Real-time Updates**: 使用 Pusher 實現即時通知和動態更新
- **Recursive Comments**: 支援無限層級的留言結構
- **@ Mention System**: 智能的用戶提及系統，優先顯示已追蹤用戶
- **Responsive Design**: 響應式設計，適配不同螢幕尺寸

### 技術亮點

- **Next.js App Router**: 使用最新的 App Router 架構
- **Server Components**: 充分利用 Server Components 提升效能
- **Type Safety**: 完整的 TypeScript 類型定義
- **Database Optimization**: 使用 Prisma 索引優化查詢效能
- **Media Handling**: 使用 Cloudinary 處理圖片上傳和優化

---

## 作者

Created by 陳竑齊, for Web Service Programming Course (wp1141) - Homework 5
