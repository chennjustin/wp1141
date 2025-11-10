# my X

一個仿 Twitter/X 的社交媒體平台，使用 Next.js 14、Prisma、PostgreSQL、NextAuth 、Pusher 、Cloudinary 打造。

## Deployed Link

**Deployed Link:** **https://myxclone.vercel.app**

---

## 功能清單

### 🔐 基礎功能

#### 註冊與登入

- ✅ **多種登入方式**
  - Google OAuth 登入
  - GitHub OAuth 登入
  - Facebook OAuth 登入（待開發）
  - UserID 快速登入（註冊時設定，下次可用 UserID 登入）
- ✅ **使用者註冊**
  - 註冊新帳號時輸入 UserID（string，唯一識別碼）
  - 同一個人使用不同的 OAuth providers 會註冊成不同的 userIDs
  - 設定顯示名稱和簡介
- ✅ **Session 管理**
  - 登入後建立 session
  - Session 未過期時可直接登入（7 天有效期）

#### 主選單（側邊欄）

- ✅ **Home** — 回到首頁動態牆
- ✅ **Profile** — 進入個人首頁
- ✅ **Post** — 發表貼文（明亮底色按鈕）
- ✅ **Notifications** — 通知頁面（顯示未讀數量紅點）
- ✅ **使用者資訊** — 顯示頭貼、姓名、UserID，點擊三個點（⋯）後顯示登出選項
- ✅ **Hover 效果** — 滑鼠懸停時按鈕會微亮 highlight

#### 編輯/瀏覽個人首頁

- ✅ **導航欄顯示**

  - 個人資料頁面的導航欄會顯示用戶名稱和貼文數量
  - 貼文數量只計算真正的貼文（`parentId: null`），不包括留言（`parentId !== null`）
  - 貼文數量會自動格式化顯示（例如：1,234 posts）
- ✅ **個人資料編輯**

  - 在主選單按下 "Profile" 可編輯個人資料
  - 姓名（從 OAuth 取得）
  - UserID（註冊時設定）
  - 簡介（Brief description）
  - 頭像（Avatar）— 支援 1:1 裁切上傳
  - 封面圖片（Cover Image）— 支援 3:1 裁切上傳
- ✅ **個人資料顯示**

  - 回到 Home 的左箭頭
  - 導航欄顯示用戶名稱和貼文數量（只計算真正的貼文，不包括留言）
  - 背景圖（Cover Image）
  - 大頭貼（Avatar），中間對齊背景圖底部
  - 姓名
  - @UserID
  - 簡介
  - 追蹤者數量（可點擊查看列表）
  - 追蹤中數量（可點擊查看列表）
- ✅ **標籤頁切換**

  - **Posts** — 顯示自己發表的貼文（`parentId: null`）
  - **Replies** — 顯示自己發表的留言（`parentId !== null`）
  - **Reposts** — 顯示自己轉發的貼文或留言
  - **Likes** — 顯示自己按讚的貼文或留言（僅限自己的檔案）
- ✅ **查看他人檔案**

  - 在貼文中點擊 userID 會顯示該使用者的個人資料（唯讀）
  - "Edit Profile" 變成 "Follow"（尚未 follow）或 "Following"（已 follow）
  - Posts 顯示該 user 所有 post/repost 過的文章
  - 不可以看到別人有按過哪些愛心（沒有 "Likes" 選項）
  - 如果未追蹤，無法查看該用戶的 Posts、Replies、Reposts 標籤頁

#### 發表文章

- ✅ **發文方式**
  - **Inline Posting**：在主頁直接發文（點擊輸入框展開）
  - **Modal Posting**：點擊側邊欄「Post」按鈕開啟發文視窗
- ✅ **發文功能**
  - 文字內容（最多 280 字元）
  - 圖片上傳（使用 Cloudinary）
  - Emoji（點擊 icon 選擇 emoji）
  - GIF 功能（待開發）
  - 字元計數顯示
  - 即時發布
- ✅ **發文工具欄設計**
  - 統一的圖標樣式（線條風格）
  - 統一的按鈕尺寸和間距
  - 圖片上傳、Emoji、GIF 三個按鈕並排顯示
  - 圖片上傳取消後自動恢復按鈕狀態
- ✅ **@ 提及功能**
  - 輸入 `@` 自動顯示候選使用者列表
  - 優先顯示已追蹤的使用者，按字母順序排序
  - 被提及的使用者會收到通知（發文和留言時都會觸發）
  - 提及內容會顯示為可點擊的連結（藍色高亮）
  - 在輸入時即時高亮顯示 @mention
- ✅ **連結辨識與處理**
  - 自動辨識連結（`https://...`、`http://...`、`ftp://...`）
  - 連結在字元計數中佔用 23 字元（不管實際長度）
  - 連結會自動建立 hyperlink（藍色可點擊）
  - 在輸入時即時高亮顯示連結
- ✅ **Hashtag 支援**
  - 支援 `#hashtag` 格式
  - Hashtag 不計入字元數，且無上限
  - Hashtag 會顯示為藍色高亮（視覺效果）
  - 在輸入時即時高亮顯示 #hashtag
- ✅ **草稿功能**（僅限 Modal Posting）
  - 按下左上 x 放棄 PO 文時會跳出視窗詢問
  - Save：存成 Draft
  - Discard：真的放棄（無法 undo）
  - 按下 "Drafts" 顯示之前放棄之草稿列表
  - 可從草稿繼續編輯

#### 閱讀文章

- ✅ **動態牆（Home Feed）**
  - 最上面的選項可切換 "For " 和 "Following"
  - **For you**：顯示所有貼文（`parentId: null`）
  - **Following**：顯示所 follow 的人所 post 和 repost 的文章
  - 文章排序：從最新到最舊
  - 使用原始貼文的 `createdAt` 時間排序（repost 不會刷新時間）
- ✅ **Inline Posting**
  - 最上面為可以 inline 發表 post 的地方
  - 點擊輸入文字框會展開類似 Modal Posting 的 layout
  - 不支援 'x' 刪除或 "Drafts" 功能
- ✅ **貼文顯示資訊**
  - 作者頭像
  - 發文時間（幾秒以前、幾分鐘以前、幾小時以前、幾天前、幾月幾日、或幾年幾月幾日）
  - 內容完整呈現（支援 @mention、#hashtag、連結的高亮顯示）
  - 下方顯示（從左至右）：留言數、轉發數、按愛心數
- ✅ **互動功能**
  - 點擊留言數可以留言
  - 點擊轉發數可以轉發（只支援 repost，不支援 quote）
  - 點擊按愛心數可以給愛心（toggling on/off，愛心為 on 時有顏色區別）
- ✅ **刪除貼文**
  - 如果是自己的發文，在右上方的 "…" 打開選項
  - 可以有 "Delete" 刪除文章的選項
  - 在 Home Feed 和 Profile 頁面都可以刪除自己的貼文
  - Note: re-post 的文章不能刪除
- ✅ **遞迴留言結構**
  - 點擊一篇文章，中間欄會 "route" 到該篇文章
  - 顯示該篇文章以及他所有的留言
  - 點擊某則留言，中間欄會 route 到該則留言
  - 該留言會像是一篇文章一樣顯示在最上面，底下則為留給該留言的留言
  - 繼續點選下方留言則會在 route 進入下一層畫面
  - 最上方會有一個左箭頭 + "Post"，讓你可以點擊後回到上一層文章列表/文章/留言
- ✅ **@mention 連結**
  - 文章中如有 @mentionSomeone 的連結，點擊後會進入該 mentionSomeone 的個人 profile

#### 即時互動（Pusher）

- ✅ **即時更新**
  - 按讚和留言會使用 Pusher 即時更新
  - 例如：使用兩個不同帳號分別登入時，其中一邊按讚了某一則貼文，另外一個帳號會即時看到該貼文的讚數增加了
  - 轉發也會即時更新
  - 新貼文會自動出現在動態牆最上面

#### 內容解析與高亮

- ✅ **即時語法高亮**

  - 在輸入時即時偵測並高亮顯示：
    - `#hashtag` — 藍色高亮（視覺效果）
    - `@mention` — 藍色高亮並可點擊連結
    - `https://...` 連結 — 藍色高亮並可點擊
  - 使用 `HighlightedTextarea` 組件實現 overlay 技術
  - 保持原有功能（@mention 自動完成、字元計數等）

#### Deploy 到 Vercel

- ✅ **部署完成** — 已部署到 Vercel，確認可以註冊登入

---

### 🚀 進階功能

#### 響應式設計（RWD）

- ✅ **手機版**
  - 參考 X (Twitter) 的移動端設計理念
  - **漢堡選單**：手機版使用漢堡選單（點擊左上角按鈕打開），桌面版保持固定側邊欄
  - 手機版選單滑動顯示（從左側滑入），包含圖標和文字標籤
  - 選單打開時顯示半透明遮罩層，點擊遮罩可關閉選單
  - 點擊導航項目後自動關閉選單
  - 主內容區域在手機版佔滿寬度（無左邊距），桌面版保持 60% 寬度
  - 所有組件都添加了響應式樣式（使用 Tailwind `md:` 前綴）
- ✅ **手機版組件調整**
  - 較小的 padding、字體大小和間距
  - 頭像尺寸：手機版 10x10，桌面版 12x12
  - 按鈕和圖標尺寸適配手機螢幕
  - 文字自動換行，防止內容溢出
  - PostModal 在手機版全屏顯示，桌面版居中顯示
- ✅ **滾動優化**
  - 側邊欄導航區域允許垂直滾動（僅在內容過多時）
  - 側邊欄整體不可滾動，確保固定佈局
  - 主內容區域可垂直滾動，禁止水平滾動
  - 所有內容容器使用 `overflow-hidden` 防止溢出

#### 主選單 | Notification

- ✅ **通知系統**
  - 顯示有多少人 repost 你的文章、Like 你的 post 或留言、@mention 你、或回覆你的貼文
  - 上面的數字代表有多少新的 notifications
  - 側邊欄顯示未讀通知數量（紅點）
  - 通知列表顯示發送者頭像、內容、時間
  - 未讀通知高亮顯示（藍色背景）
  - 直接標記已讀的功能（Mark read 按鈕）
  - 點擊通知可導向相關貼文或個人檔案
  - 即時通知（使用 Pusher）
- ✅ **通知觸發機制**
  - **發文時 @mention**：被提及的用戶會收到通知
  - **留言時 @mention**：被提及的用戶會收到通知（即使不是回覆給他們）
  - **留言回覆**：原始貼文/留言的作者會收到通知
  - **Repost 貼文**：原始貼文的作者會收到通知
  - **Repost 留言**：留言的作者和原始貼文的作者都會收到通知
  - **按讚**：原始貼文/留言的作者會收到通知
  - 所有通知都不會通知自己

#### New Post Notice

- ✅ **新貼文提醒**
  - 當你 follow 的人有新的 post 或 repost 時，在 "Following" tab 的中間欄上方顯示提醒
  - 只在用戶滾動後（不在頂部）時顯示，避免干擾
  - 顯示前三個發文/轉發者的頭像（重疊顯示）
  - 橢圓形藍色氣泡設計，包含向上箭頭圖標和 "posted" 文字
  - 點擊後自動滾動到頂部並刷新 feed
  - 切換 tab 或刷新 feed 時自動清除提醒
  - 使用 Pusher 即時檢測新貼文，無需手動刷新

#### 圖片裁切功能

- ✅ **頭像裁切**
  - 上傳頭貼時，使用 `react-easy-crop` 進行 1:1 裁切，可縮放與移動
  - 裁切後轉換為 blob 上傳到 Cloudinary
  - 輸出解析度：512x512
- ✅ **封面裁切**
  - 上傳封面時，使用 `react-easy-crop` 進行 3:1 裁切，可縮放與移動
  - 裁切後轉換為 blob 上傳到 Cloudinary
  - 輸出解析度：1536x512

#### 其他多媒體支援

- ✅ **Emoji 選擇器**
  - 使用 `@emoji-mart/react` 套件
  - 點擊笑臉圖標打開 emoji 選擇器
  - 選擇 emoji 後自動插入到游標位置
  - 支援所有標準 emoji
- ⚠️ **GIF 功能**
  - 待開發（需要 Giphy API key）

---

## 詳細功能說明

### 留言與互動

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
  - 在 Home Feed 和 Profile 頁面都可以刪除自己的貼文
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
- **圖片裁切**: react-easy-crop
- **Emoji 選擇器**: @emoji-mart/react
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
│   │   │   ├── upload/        # 上傳相關 API
│   │   │   └── gifs/          # GIF 相關 API（待開發）
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
│   │   ├── EmojiPicker.tsx    # Emoji 選擇器
│   │   ├── HighlightedTextarea.tsx # 高亮文字輸入框
│   │   └── ...
│   ├── lib/                   # 工具函數庫
│   │   ├── prisma.ts         # Prisma 客戶端
│   │   ├── auth.ts           # NextAuth 設定
│   │   ├── pusher/           # Pusher 設定
│   │   ├── serializers.ts    # 資料序列化
│   │   ├── content-parser.tsx # 內容解析（URL、hashtag、mention）
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
/api/upload/cropped              # 上傳裁切後的圖片到 Cloudinary
/api/gifs                        # 取得 GIF（Giphy API 代理，待開發）
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
   → 建立 repost 通知給原始貼文/留言的作者（不通知自己）
   → 如果 repost 的是留言，也通知原始貼文的作者（不通知自己）
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
   → 建立 comment 通知給原始貼文/留言的作者（不通知自己）
   → 檢測 @mention，建立 mention 通知給被提及的用戶（不通知自己）
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

   # Giphy (Optional, for GIF feature)
   NEXT_PUBLIC_GIPHY_API_KEY="..."
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
