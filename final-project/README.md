# Coin Undergraduate

**組別**: 第 11 組

- **曾煥軒** (B12705002) - 資管三
- **陳竑齊** (B12705017) - 資管三
- **曾文儀** (B12705018) - 資管三

## 專題簡介

Coin Undergraduate 是一個記帳與分帳系統。本系統支援多人協作的錢包管理、自動分帳計算、訂閱服務自動記帳等功能，幫助使用者輕鬆管理個人與群體財務。

本專題採用 Next.js 14 的 App Router 架構，搭配 Prisma ORM 與 PostgreSQL 資料庫，實作完整的全端應用程式。系統支援 Google OAuth 登入、即時通知推送、以及自動化的訂閱交易處理機制。

**部署連結**: [coin-undergraduate.ocean1029.com](https://coin-undergraduate.ocean1029.com)

**Demo 影片連結**: [影片雲端](https://drive.google.com/drive/folders/1Zw2Lfztm7rCqWA3icR-8iXlFuKF4cxA1?usp=sharing)


## 核心功能

### 錢包管理

使用者可以建立多個獨立的錢包，每個錢包可以設定預設幣別與描述。錢包支援多人協作，成員可以分為 OWNER、MEMBER、VIEWER 三種角色。使用者可以將常用錢包釘選到首頁，系統會記住使用者上次選擇的錢包作為預設錢包。

例如，使用者可以建立「主要錢包」用於個人日常開銷、「投資錢包」用於投資理財、「日本出遊」錢包用於與朋友共同出遊的費用分攤，並以日元記帳。

### 交易記帳

系統支援收入與支出兩種交易類型，每筆交易可以設定日期、金額、幣別、標籤、名稱與備註。當交易使用非預設幣別時，系統會記錄匯率，方便後續統計與報表生成。

使用者可以在首頁查看當日所有交易與當月收支總覽，也可以在歷史明細頁面進行完整操作。系統提供標籤篩選功能，方便使用者快速分類與查詢交易記錄。

### 分帳功能

每筆交易可以設定多個付款人與分帳人，支援複雜的分帳情境。例如，當一群人聚餐時，可以由一人先付款，然後按照金額分配給所有參與者。

系統會自動計算每個成員的結餘狀態，並提供最優化的還款建議，幫助使用者快速了解誰該還誰多少錢。

### 訂閱服務管理

使用者可以建立訂閱項目，設定金額、幣別、週期、開始日期與結束日期。系統會在每個週期到期時自動建立對應的交易記錄。
訂閱項目同樣支援分帳功能，可以設定付款人與分帳人，方便管理像是 Netflix、Spotify 等多人共享的訂閱服務。

### 自動化處理

系統透過 Vercel Cron Jobs 每日執行 `/api/cron/add-transaction` 端點，檢查所有到期訂閱並自動建立交易記錄。此機制確保訂閱費用能夠準時記帳，無需使用者手動操作。

### 通知系統

系統提供兩種通知機制：資料庫通知與即時推送通知。當訂閱費用即將扣款前兩天，系統會發送提醒通知；當有成員還款時，相關使用者也會收到通知。

通知支援已讀標記，使用者可以在通知頁面查看所有未讀與已讀通知。

### 標籤系統

系統提供預設的支出與收入標籤，例如「飲食」、「飲料」「旅遊」等支出標籤，以及「薪水」、「投資」等收入標籤。

使用者也可以建立自訂標籤，每個標籤可以設定圖示方便視覺化識別。

### API 文件服務

系統提供完整的 Swagger/OpenAPI 文件，可以在 `/api-docs` 頁面查看互動式 API 文件。

## 技術架構

### 前端技術

- **Next.js 14**: 採用 App Router 架構，支援 Server Components 與 Client Components 的混合使用
- **React 18**: 使用最新的 React Hooks 與 Concurrent Features
- **TypeScript**: 完整的型別檢查與 IntelliSense 支援
- **Tailwind CSS**: 實用優先的 CSS 框架，提供響應式設計
- **Lucide React**: 現代化的圖示庫
- **Recharts**: 用於資料視覺化的圖表庫

### 後端技術

- **Next.js API Routes**: 使用 Next.js 內建的 API 路由處理後端邏輯
- **Prisma**: 型別安全的 ORM，提供資料庫遷移與查詢功能
- **PostgreSQL**: 關聯式資料庫，儲存所有應用程式資料
- **NextAuth.js**: 處理 Google OAuth 登入與 session 管理
- **Zod**: Runtime schema validation，用於環境變數與 API 請求驗證

### 即時通訊

- **Pusher**: 即時通知推送服務，當有新通知時會透過 WebSocket 即時推送到前端

### 部署與自動化

- **Vercel**: 雲端部署平台，提供自動 CI/CD 與 Cron Jobs 功能
- **Vercel Cron**: 每日自動執行訂閱交易處理任務

### 開發工具

- **Vitest**: 單元測試框架
- **Playwright**: 端對端測試框架
- **Swagger/OpenAPI**: API 文件自動生成

## 專案架構

本專案採用模組化架構，將功能按照領域劃分為不同的模組：

```text
final-project/
├── app/                    # Next.js App Router 路由與頁面
│   ├── (auth)/            # 認證相關頁面（登入、註冊）
│   ├── api/               # API 路由處理器
│   │   ├── auth/          # 認證相關 API
│   │   ├── wallets/       # 錢包相關 API
│   │   ├── transactions/  # 交易相關 API
│   │   ├── subscriptions/ # 訂閱相關 API
│   │   ├── notifications/ # 通知相關 API
│   │   ├── cron/          # 定時任務 API
│   │   └── docs/          # API 文件端點
│   ├── wallets/           # 錢包相關頁面
│   └── api-docs/          # Swagger UI 頁面
├── modules/               # 業務邏輯模組
│   ├── wallet/            # 錢包模組
│   ├── transaction/      # 交易模組
│   ├── subscription/     # 訂閱模組
│   ├── notification/      # 通知模組
│   ├── tag/              # 標籤模組
│   ├── user/             # 使用者模組
│   └── carrier/          # 載具模組
├── lib/                   # 共用函式庫
│   ├── prisma.ts         # Prisma Client 單例
│   ├── auth.ts           # NextAuth 設定
│   ├── swagger.ts        # Swagger 文件設定
│   └── pusher-server.ts  # Pusher 伺服器端設定
├── ui/                    # UI 元件與樣式
│   ├── components/       # React 元件
│   └── utils/            # UI 工具函數
├── hooks/                 # React Hooks
├── config/                # 設定檔
├── prisma/                # Prisma 設定與遷移
│   ├── schema.prisma     # 資料庫 Schema
│   ├── seed.ts           # 資料庫種子資料
│   └── migrations/       # 資料庫遷移記錄
└── test/                  # 測試檔案
```

### 請求流程

當使用者在前端發起請求時，請求會經過以下流程：

1. **前端 UI** (`app/wallets/*`, `ui/components/*`) 發起 API 請求
2. **Middleware** (`middleware.ts`) 檢查認證狀態，未登入使用者會被導向登入頁面
3. **API Route Handler** (`app/api/*/route.ts`) 處理請求，驗證權限
4. **Service Layer** (`modules/*/services/*.service.ts`) 執行業務邏輯
5. **Repository Layer** (`modules/*/repositories/*.repository.ts`) 與資料庫互動
6. **Prisma Client** (`lib/prisma.ts`) 執行實際的資料庫查詢
7. 回應沿相同路徑返回前端

## 本地開發環境設定

### 前置需求

- **Node.js**: 建議使用 Node.js 18.x 或以上版本
- **npm**: 隨 Node.js 一起安裝
- **Docker**: 用於執行 PostgreSQL 資料庫

### 步驟一：安裝依賴套件

在專案根目錄執行：

```bash
npm ci
```

此指令會根據 `package-lock.json` 安裝所有依賴套件，確保版本一致性。

### 步驟二：啟動 PostgreSQL 資料庫

使用 Docker 啟動 PostgreSQL 容器：

```bash
docker run --name coin-undergraduate-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=accounting_db \
  -p 5432:5432 \
  -d postgres:15
```

此指令會建立一個名為 `coin-undergraduate-db` 的 PostgreSQL 容器，資料庫名稱為 `accounting_db`，密碼為 `password`，並將 5432 埠映射到主機。

如果容器已經存在，可以使用以下指令啟動：

```bash
docker start coin-undergraduate-db
```

### 步驟三：設定環境變數

複製 `.env.example` 檔案為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env`，填入必要的環境變數：

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/accounting_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# Pusher (Optional)
NEXT_PUBLIC_PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

**重要說明**：

- `DATABASE_URL`: 必須與 Docker 容器的設定一致
- `NEXTAUTH_SECRET`: 可以使用以下指令產生：`openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET`: 需要申請 Google OAuth 憑證（見下方「認證設定」章節）
- Pusher 相關變數為可選，如果未設定，即時通知功能會自動停用

### 步驟四：執行資料庫遷移

產生 Prisma Client 並執行資料庫遷移：

```bash
npm run db:migrate
```

### 步驟五：匯入種子資料

執行種子腳本，建立測試資料：

```bash
npm run db:seed
```

此指令會建立：

- 系統使用者（用於系統標籤）
- 測試使用者（user1, user2）
- 預設標籤（支出與收入標籤）
- 範例錢包與交易記錄

### 步驟六：啟動開發伺服器

執行以下指令啟動 Next.js 開發伺服器：

```bash
npm run dev
```

伺服器會在 `http://localhost:3000` 啟動。開啟瀏覽器訪問該網址即可看到應用程式。

## API 文件

系統提供完整的 Swagger/OpenAPI API 文件。

### 互動式 API 文件（Swagger UI）

訪問 `http://localhost:3000/api-docs` 可以查看互動式 API 文件。此頁面提供：

- 所有 API 端點的完整列表
- 每個端點的請求參數與回應格式說明
- 直接在瀏覽器中測試 API 的功能
- 認證資訊自動帶入（如果已登入）

## 測試

專案包含三種層級的測試：

### 單元測試（Unit Tests）

使用 Vitest 進行單元測試，測試 API Route Handlers 的邏輯：

```bash
npm run test
```

測試檔案位於 `test/` 目錄，使用 mock 的方式隔離外部依賴（如 Prisma、NextAuth），確保測試的獨立性與速度。

### HTTP 層級測試

使用 Vitest 進行 HTTP 層級的整合測試，需要先啟動開發伺服器：

```bash
# Terminal 1: 啟動開發伺服器
npm run dev

# Terminal 2: 執行 HTTP 測試
npx vitest --run test/wallets-api.http.test.ts
```

這些測試會對實際運行的伺服器發送 HTTP 請求，驗證端點的行為。

### 端對端測試（E2E Tests）

使用 Playwright 進行端對端測試，模擬真實使用者的操作流程：

```bash
npm run test:e2e
```

測試檔案位於 `e2e/` 目錄，會啟動瀏覽器並執行完整的操作流程測試。

## 資料庫管理指令

專案提供多個資料庫管理指令：

- `npm run db:generate`: 產生 Prisma Client
- `npm run db:migrate`: 執行資料庫遷移
- `npm run db:studio`: 開啟 Prisma Studio，提供圖形化介面管理資料庫
- `npm run db:seed`: 執行種子腳本，建立測試資料
- `npm run db:reset`: 重置資料庫


部署流程會自動執行：

1. `npm ci` 安裝依賴
2. `prisma generate` 產生 Prisma Client
3. `next build` 建置應用程式
4. 部署到 Vercel 邊緣網路

### 負責項目

每位組員均參與專案的所有核心功能開發，包括：

- **前端開發**: React 元件設計與實作、使用者介面優化、響應式設計
- **後端開發**: API 路由設計、業務邏輯實作、資料庫查詢優化
- **功能實作**: 錢包管理、交易記帳、分帳計算、訂閱管理、通知系統
- **測試與除錯**: 單元測試撰寫、整合測試、Bug 修復
- **文件撰寫**: API 文件、程式碼註解、README 文件

細項：

- 曾煥軒：登入、記帳功能後端開發、分帳功能
- 曾文儀：主畫面與多 Wallet 功能、通知
- 陳竑齊：Transaction、訂閱

## 使用與參考的框架、模組、原始碼

### 核心框架與函式庫

- **Next.js 14**: [官方文件](https://nextjs.org/docs)
- **React 18**: [官方文件](https://react.dev/)
- **Prisma**: [官方文件](https://www.prisma.io/docs)
- **NextAuth.js**: [官方文件](https://next-auth.js.org/)
- **TypeScript**: [官方文件](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [官方文件](https://tailwindcss.com/docs)
- **Zod**: [官方文件](https://zod.dev/)

### 第三方服務

- **Pusher**: [官方文件](https://pusher.com/docs)
- **Vercel**: [官方文件](https://vercel.com/docs)
- **Google OAuth**: [官方文件](https://developers.google.com/identity/protocols/oauth2)

### 開發工具與測試框架

- **Vitest**: [官方文件](https://vitest.dev/)
- **Playwright**: [官方文件](https://playwright.dev/)
- **Swagger UI**: [官方文件](https://swagger.io/tools/swagger-ui/)

## 專題製作心得

（此部分由組員共同撰寫，描述專題開發過程中的學習與收穫）

## 課程建議


