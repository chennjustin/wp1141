# Survival Wave Game（React + TypeScript + Vite）

使用 React + TypeScript + Vite 開發的生存波次小遊戲。玩家在畫布中移動，系統會自動朝最近的敵人發射彈丸；清空一波之後可進入商店購買升級。

## 推薦 Git 版本控制忽略（.gitignore）
推到 GitHub 時，以下內容通常不需要提交：

- node_modules/
- dist/
- .vite/
- .env、.env.*（若有敏感設定）
- 各種暫存與記錄：npm-debug.log*、yarn-*.log、pnpm-debug.log*
- 作業系統/編輯器快取：.DS_Store、Thumbs.db

（如你尚未建立 .gitignore，可在專案根目錄新增，填入上列條目）

## 專案結構

```
hw2/
├─ index.html                # 入口 HTML
├─ package.json              # 腳本與依賴
├─ tsconfig.json             # TypeScript 設定（前端）
├─ tsconfig.node.json        # TypeScript 設定（Node/Vite）
├─ vite.config.ts            # Vite 設定（含路徑別名）
├─ src/
│  ├─ main.tsx              # React 入口，掛載 App
│  ├─ App.tsx               # App 骨架：選單 / 畫布 / HUD / 商店
│  ├─ styles.css            # 簡單樣式
│  ├─ components/
│  │  ├─ GameCanvas.tsx    # <canvas> 渲染與 rAF 迴圈、鍵盤輸入
│  │  ├─ HUD.tsx           # 頂部 HUD（HP / 金錢 / 輪次 / 階段）
│  │  └─ ShopModal.tsx     # 商店（購買升級）
│  ├─ game/
│  │  ├─ GameContext.tsx   # 世界狀態與核心更新（useRef 儲存）
│  │  ├─ constants.ts      # 常數（畫布、角色初始值）
│  │  ├─ types.ts          # 型別（World / Player / Enemy / Projectile / Wave / UI）
│  │  └─ utils.ts          # 工具（距離、單位向量、邊緣生成）
│  └─ hooks/
│     └─ useRaf.ts         # 可重用 rAF Hook（備用）
```

## 設計說明
- 狀態切分：`player, enemies[], projectiles[], wave, phase` 集中於 `useRef` 的 world（非受控），避免每幀大量觸發 React re-render。
- UI 最小同步：僅將 HP / 金錢 / 輪次 / 階段以 React state 同步到介面（HUD）。
- 遊戲主迴圈：以 `<canvas>` + `requestAnimationFrame` 每幀更新與繪製。
- 自動攻擊：固定間隔找出射程內最近敵人，產生彈丸（含速度向量）。
- 敵人 AI：從地圖邊緣隨機出生，持續朝玩家移動；與玩家碰撞即 Game Over。
- 波次與商店：清空當前波次敵人 → 進入商店 → 發放金錢 → 可購買升級（攻擊力、攻速、射程）→ 按 Enter 或「繼續」進入下一波；每波提升敵人 HP / 速度與生成速度。
- 預留新武器：`ShopModal` 內保留「新武器」占位，便於未來擴充。

## 遊戲玩法
- 移動：方向鍵 或 WASD。
- 自動攻擊：以固定間隔自動朝「射程內最近」的敵人發射彈丸。
- 敵人：從地圖邊緣生成並朝玩家逼近。
- 碰撞：敵人碰到玩家即結束（HP 歸零 → Game Over）。
- 波次：每一波有固定生成數量；新波強度上升。
- 商店：清光該波敵人後自動進入，可購買升級；按 Enter 或按鈕「繼續」進入下一波。

## 如何開始
1) 安裝依賴：
```bash
npm install
```
2) 啟動開發伺服器：
```bash
npm run dev
```
3) 於瀏覽器開啟 Vite 顯示的位址（通常為 `http://localhost:5173/`）。

## 依賴
- 執行時：`react`, `react-dom`
- 開發時：`vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
