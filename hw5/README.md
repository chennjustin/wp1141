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
  - Facebook OAuth 登入（待開發，目前無法使用）
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

#### 📝 Post（貼文）邏輯

- **貼文與留言的獨立性**

  - 貼文和留言都是獨立的根對象，各自擁有 `likeCount`、`repostCount`、`replyCount`、`createdAt`、`authorId`
  - 每個貼文/留言的互動計數只計算直接對該對象的操作
  - 例如：對留言按讚只會增加留言的 `likeCount`，不會影響父貼文的計數
- **Home Feed 顯示規則**

  - Home feed（For You）只顯示貼文（`parentId: null`），不顯示留言
  - 如果留言被當前用戶或追蹤的用戶 repost，則該留言會顯示在 feed 中
  - Repost 不會刷新貼文的 `createdAt` 時間，使用原始貼文的時間進行排序
  - 使用 Map 去重，確保同一貼文不會重複顯示
- **貼文刪除**

  - 作者可以透過右上角「...」選單刪除自己的貼文
  - 轉發的貼文無法刪除（只能取消轉發）
  - 刪除貼文會同時刪除所有相關的留言、按讚、轉發記錄（Cascade Delete）

#### 🔄 Repost（轉發）邏輯

- **轉發機制**

  - 可以轉發貼文或留言
  - 轉發是切換操作（Toggle）：再次點擊可取消轉發
  - 轉發後會建立 `Repost` 記錄，包含 `userId`、`postId`、`createdAt`
- **轉發計數規則**

  - `repostCount` 只計算直接 repost 該貼文/留言的數量
  - 例如：如果轉發一個留言，只會增加留言的 `repostCount`，不會影響父貼文的計數
  - 每個用戶對同一貼文/留言只能 repost 一次（透過 `@@unique([userId, postId])` 約束）
- **Feed 中的顯示邏輯**

  - **Home Feed（For You）**：
    - 如果當前用戶 repost，顯示 "You reposted" 標籤
    - 不顯示其他用戶的 repost 標籤
    - Repost 後，貼文會自動移到 feed 最上面
  - **Following Feed**：
    - 如果當前用戶 repost，顯示 "You reposted"
    - 如果追蹤的用戶 repost，顯示 "(userID) reposted" 並可點擊查看該用戶檔案
  - **Reposted 留言的顯示**：
    - 如果 repost 的是留言，只顯示留言內容和 "View original post" 連結
    - 不顯示完整的父貼文卡片，簡化顯示
- **時間排序**

  - Repost 的貼文使用原始貼文的 `createdAt` 時間進行排序
  - 不使用 repost 的 `createdAt`，確保 feed 按原始發文時間排序
- **通知機制**

  - 轉發時會發送通知給原貼文/留言的作者（不通知自己）
  - 通知類型為 `repost`

#### 💬 Reply（留言）邏輯

- **遞迴留言結構**

  - 留言是遞迴結構，可以無限層級回覆
  - 每個留言都有 `parentId` 指向父貼文或父留言
  - 留言本身也可以被回覆，形成樹狀結構
- **顯示規則**

  - 留言只在貼文詳情頁顯示，不會出現在 Home feed
  - 點擊留言會進入該留言的詳情頁（`/post/[replyId]`）
  - 在留言詳情頁，該留言會顯示在最上面，下方顯示其回覆
  - 如果留言本身是回覆（有 `parent`），會顯示 "View original post" 連結
- **留言的獨立性**

  - 留言有自己的 `likeCount`、`repostCount`、`replyCount`
  - 對留言按讚/轉發只會更新留言的計數，不影響父貼文
  - 留言可以被 repost，repost 後會顯示在 feed 中（如果被當前用戶或追蹤用戶 repost）
- **留言功能**

  - 留言支援 @ 提及功能
  - 留言不支援草稿功能
  - 留言可以包含圖片

#### ❤️ Like（按讚）邏輯

- **按讚機制**

  - 可以對貼文或留言按讚
  - 按讚是切換操作（Toggle）：再次點擊可取消按讚
  - 按讚後會建立 `Like` 記錄，包含 `userId`、`postId`、`createdAt`
- **按讚計數規則**

  - `likeCount` 只計算直接 like 該貼文/留言的數量
  - 例如：對留言按讚只會增加留言的 `likeCount`，不會影響父貼文的計數
  - 每個用戶對同一貼文/留言只能 like 一次（透過 `@@unique([userId, postId])` 約束）
- **UI 更新**

  - 按讚後愛心圖示變為紅色
  - 顯示即時更新的按讚數量
- **通知機制**

  - 按讚時會發送通知給原貼文/留言的作者（不通知自己）
  - 通知類型為 `like`
- **Profile 頁面的特殊邏輯**

  - 在 Profile 的 "Likes" 標籤頁中，取消按讚不會立即從列表中移除項目
  - 只有當頁面刷新後，如果確實被取消按讚，項目才會從列表中消失
  - 這樣可以防止雙擊導致的意外移除
- **Profile 頁面的 "Reposts" 標籤頁**

  - 取消 repost 不會立即從列表中移除項目
  - 只有當頁面刷新後，如果確實被取消 repost，項目才會從列表中消失
  - 同樣防止雙擊導致的意外移除

### 📱 動態牆（Feed）

- **For You 動態**

  - 顯示所有用戶的貼文（`parentId: null`）
  - 顯示被 repost 的貼文
  - 不顯示留言（除非留言被 repost）
  - 按時間排序（最新的在前，使用原始貼文的 `createdAt`）
  - Repost 後貼文會自動移到最上面
  - 即時更新新貼文（Pusher）
  - 使用 Map 去重，確保同一貼文不會重複顯示
- **Following 動態**

  - 僅顯示已追蹤用戶的貼文和 repost
  - 如果追蹤的用戶 repost 了留言，該留言也會顯示
  - 顯示 "You reposted" 或 "(userID) reposted" 標籤
  - 切換標籤即可切換動態類型
  - 即時更新
- **貼文顯示**

  - 作者頭像
  - 作者名稱與 UserID（可點擊進入個人檔案）
  - 發文時間（幾秒前、幾分鐘前、幾小時前、幾天前、幾月幾日、幾年幾月幾日）
  - 完整內容顯示（支援 @mention 和 #hashtag 連結）
  - 互動統計（留言數、轉發數、按讚數）
  - 可點擊互動按鈕進行操作
  - Repost 標籤顯示（"You reposted" 或 "(userID) reposted"）
  - 如果 repost 的是留言，顯示簡化版本和 "View original post" 連結

### 👤 個人檔案

- **個人檔案頁面**

  - 顯示使用者資訊（名稱、UserID、簡介）
  - 顯示頭像與封面圖片
  - 顯示追蹤者與追蹤中數量（可點擊查看列表）
  - **標籤頁切換**：
    - **Posts**：顯示使用者自己發表的貼文（`parentId: null`）
    - **Replies**：顯示使用者發表的留言（`parentId !== null`）
    - **Reposts**：顯示使用者轉發的貼文或留言
    - **Likes**：顯示使用者按讚的貼文或留言（僅限自己的檔案）
  - 編輯個人資料按鈕（僅限自己的檔案）
  - 查看他人檔案時，如果未追蹤，會顯示提示訊息
- **追蹤功能**

  - 追蹤/取消追蹤其他使用者
  - 顯示追蹤狀態，且即時更新追蹤數量
  - 如果未追蹤，無法查看該用戶的 Posts、Replies、Reposts 標籤頁
- **追蹤者與追蹤中列表**

  - 查看使用者的追蹤者列表和追蹤中列表
  - 可直接在列表中追蹤/取消追蹤
  - 從個人檔案頁面點擊數量會導向對應標籤
  - 顯示每個用戶的頭像、名稱、UserID 和追蹤狀態
- **Profile 頁面的互動邏輯**

  - 在 "Likes" 和 "Reposts" 標籤頁中，取消按讚或取消 repost 不會立即從列表中移除項目
  - 只有當頁面刷新後，如果確實被取消，項目才會從列表中消失
  - 這樣可以防止雙擊導致的意外移除
  - 按鈕狀態（圖標顏色、計數）會立即更新，但項目會保留在列表中直到刷新

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

  - 點擊貼文進入詳情頁（`/post/[id]`）
  - 顯示貼文與所有留言（使用 `getNestedReplies` 遞迴獲取）
  - 預設顯示第一層留言，有 "顯示更多回應" 按鈕
  - 點擊留言的留言按鈕可進入該留言的詳情頁
  - 留言會變成主要顯示內容，下方顯示其回覆
  - 支援無限層級瀏覽
  - 如果留言本身是回覆（有 `parent`），會顯示 "View original post" 連結
- **互動功能**

  - 可以對主貼文和留言進行按讚、轉發、回覆
  - 所有互動都會即時更新（Pusher）
  - 使用 Optimistic Update 提供流暢體驗

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
/api/user/[id]/replies            # 取得用戶的留言
/api/user/[id]/reposts            # 取得用戶轉發的貼文/留言
/api/user/me/following-ids        # 取得當前用戶追蹤的用戶 ID 列表
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
   → POST /api/post → Prisma 建立 Post（parentId: null）
   → Pusher 推送 POST_CREATED 事件 → 所有客戶端更新
   → 建立提及通知 → Pusher 推送 NOTIFICATION_CREATED 事件
   → Home Feed：新貼文自動出現在最上面
   ```
2. **轉發（Repost）流程**

   ```
   用戶點擊轉發按鈕
   → Optimistic Update（UI 立即更新，repost 圖標變色）
   → POST /api/repost → 檢查是否已 repost（查詢 Repost 表）
   → 如果未 repost：建立 Repost 記錄（userId, postId）
   → 如果已 repost：刪除 Repost 記錄
   → 更新 post.repostCount（使用 _count.reposts）
   → Pusher 推送 POST_REPOSTED 事件（包含 postId 和 repostCount）
   → 建立 repost 通知（不通知自己）
   → 所有訂閱的客戶端接收並更新 UI
   → Home Feed：如果 repost 貼文，移到最上面
   → Profile Reposts Tab：項目保留在列表中（直到刷新）
   ```
3. **按讚（Like）流程**

   ```
   用戶點擊愛心按鈕
   → Optimistic Update（UI 立即更新，愛心變紅色）
   → POST /api/like → 檢查是否已 like（查詢 Like 表）
   → 如果未 like：建立 Like 記錄（userId, postId）
   → 如果已 like：刪除 Like 記錄
   → 更新 post.likeCount（使用 _count.likes）
   → Pusher 推送 POST_LIKED 事件（包含 postId 和 likeCount）
   → 建立 like 通知（不通知自己）
   → 所有訂閱的客戶端接收並更新 UI
   → Profile Likes Tab：項目保留在列表中（直到刷新）
   ```
4. **留言（Reply）流程**

   ```
   用戶點擊留言按鈕 → 開啟 ReplyModal
   → 輸入內容（支援 @ 提及）→ 上傳媒體（如有）
   → POST /api/comment → Prisma 建立 Post（parentId 指向父貼文/留言）
   → 更新父貼文的 commentCount（使用 _count.replies）
   → Pusher 推送 POST_REPLIED 事件（包含 parentId 和 commentCount）
   → 建立 comment 通知（不通知自己）
   → 所有訂閱的客戶端接收並更新 UI
   → PostDetailPage：新增留言到 replies 列表
   → 留言不會出現在 Home Feed（除非被 repost）
   ```
5. **Feed 載入流程**

   ```
   用戶訪問 Home Feed
   → GET /api/post（For You）或 GET /api/feed?filter=following（Following）
   → 查詢所有 reposted posts（parentId: null，只顯示貼文）
   → 使用 Map 去重（確保同一貼文只出現一次）
   → 查詢原始貼文（排除已被 repost 的）
   → 合併並按 createdAt 排序（使用原始貼文時間）
   → 返回 posts 數組
   → 前端渲染 PostCard 列表
   → Repost 後貼文自動移到最上面
   ```
6. **通知流程**

   ```
   事件發生（按讚/轉發/留言/追蹤/提及）
   → createNotification()
   → Prisma 建立 Notification（type, senderId, receiverId, postId）
   → Pusher 推送 NOTIFICATION_CREATED 事件
   → 接收者客戶端顯示通知
   → 側邊欄顯示紅點（使用 NotificationContext）
   → 標記已讀 → POST /api/notification
   → Pusher 推送 NOTIFICATION_READ 事件
   → 即時更新未讀數量（不需刷新頁面）
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
