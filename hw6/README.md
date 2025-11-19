# Line Bot 智慧聊天機器人系統

這是一個整合 Line Messaging API 的智慧聊天機器人系統，使用 Next.js、TypeScript、MongoDB 和 OpenAI 開發。

## 功能特色

- 🤖 **Line Bot 對話功能**：接收使用者訊息並透過 LLM 產生回應
- 💬 **對話管理**：完整儲存對話歷史與上下文
- 📊 **管理後台**：檢視對話紀錄、統計資料與即時更新
- 🔄 **優雅降級**：LLM 服務失敗時提供友善的錯誤訊息
- 🎯 **個人小幫手**：協助資訊整理、記錄、搜尋與問題回應

## 技術棧

- **框架**: Next.js 14+ (App Router) + TypeScript
- **資料庫**: MongoDB Atlas + Mongoose
- **Line API**: Line Messaging API (直接整合)
- **LLM**: OpenAI (GPT-3.5/GPT-4)
- **樣式**: Tailwind CSS
- **驗證**: Zod
- **部署**: Vercel

## 環境變數設定

### 1. MongoDB Atlas 設定

詳細步驟請參考：[MongoDB Atlas 設定指南](./docs/MONGODB_SETUP.md)

快速步驟：
1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 註冊免費帳號
2. 建立免費叢集（M0）
3. 設定資料庫使用者和網路存取權限
4. 取得連線字串

### 2. 建立環境變數檔案

複製 `.env.example` 並建立 `.env.local`，填入以下變數：

```env
# Line Messaging API
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token

# LLM (OpenAI)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/line-bot?retryWrites=true&w=majority

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ 注意：將 MongoDB 連線字串中的 `username`、`password` 和 `cluster0.xxxxx` 替換為實際值

## 安裝與執行

1. 安裝依賴：
```bash
npm install
```

2. 設定環境變數（見上方）

3. 執行開發伺服器：
```bash
npm run dev
```

4. 開啟瀏覽器訪問 `http://localhost:3000`

## Line Bot 設定

1. 前往 [Line Developers](https://developers.line.biz/) 建立 Provider 和 Channel
2. 取得 Channel Secret 和 Channel Access Token
3. 設定 Webhook URL：`https://your-domain.com/api/webhook/line`
4. 啟用 Webhook

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── conversations/    # 對話管理頁面
│   └── page.tsx          # 管理後台首頁
├── bot/                   # Bottender Bot 設定
│   ├── handlers/         # 訊息處理器
│   └── sessions/         # Session 管理
├── components/            # React 元件
├── lib/                   # 工具函數與配置
├── models/                # Mongoose 資料模型
├── services/              # 業務邏輯層
└── types/                 # TypeScript 類型定義
```

## API 端點

- `POST /api/webhook/line` - Line Webhook 接收端點
- `GET /api/conversations` - 取得對話列表（支援篩選）
- `GET /api/conversations/[id]` - 取得單一對話詳情
- `GET /api/stats` - 取得統計資料
- `GET /api/health` - 健康檢查端點

## 部署至 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 部署完成後，更新 Line Webhook URL

## 授權

MIT License

