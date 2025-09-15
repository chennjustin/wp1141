# 陳竑齊 - 個人網站

一個現代化、響應式的個人網站，使用 HTML、CSS 和 TypeScript 建構，展現個人履歷、旅行經歷和聯絡資訊。

## 🌟 網站特色

### 現代化設計
- 簡潔優雅的視覺設計，採用溫暖的配色方案
- 流暢的動畫效果和懸停互動
- 深色/淺色主題切換功能
- 完全響應式設計，適配各種設備

### 多頁面架構
- **首頁 (Home)**: 個人介紹卡片，包含動態標題輪播和興趣標籤
- **關於我 (About)**: 詳細的個人履歷、技能展示、工作經驗和興趣
- **旅行 (Travel)**: 互動式旅行相簿，展示日本、香港澳門的旅程
- **聯繫 (Contact)**: 聯絡資訊和訊息表單

### 豐富的互動功能
- **動態標題輪播**: 首頁標題自動切換，配合指示點動畫
- **模態視窗**: 旅行頁面的詳細旅程展示
- **主題切換**: 深色/淺色模式，自動保存偏好
- **滾動動畫**: 元素進入視窗時的淡入動畫
- **表單驗證**: 即時表單驗證和錯誤提示
- **複製功能**: 一鍵複製聯絡資訊

## 📱 響應式設計

### 桌面版 (>768px)
- 兩欄布局（個人卡片 + 介紹文字）
- 完整的導航欄和所有功能
- 網格布局展示內容

### 平板版 (768px-480px)
- 調整為單欄布局
- 保持主要功能
- 優化觸控體驗

### 手機版 (<480px)
- 漢堡選單導航
- 垂直堆疊布局
- 觸控友好的按鈕大小

## 🎨 設計靈感

### 首頁設計
- **個人卡片**: 頭像、姓名、動態標題、興趣標籤、社交連結
- **介紹文字**: 個人簡介和背景故事
- **動畫效果**: 標題自動輪播，指示點同步變化

### 旅行頁面
- **目的地卡片**: 封面圖片、日期、地點、描述、標籤
- **模態視窗**: 國旗、行程亮點、照片集、Google地圖
- **互動設計**: 懸停效果、點擊展開詳細資訊

## 🛠️ 技術規格

### 前端技術
- **HTML5**: 語義化標記，無障礙設計
- **CSS3**: Flexbox、Grid、動畫、響應式設計
- **TypeScript**: 類型安全的JavaScript，模組化程式設計
- **Font Awesome**: 圖標庫
- **Google Fonts**: Inter 字體

### 架構特色
- **模組化設計**: 每個頁面獨立的TypeScript文件
- **共用組件**: 導航欄和頁腳由首頁統一管理
- **類型安全**: 完整的TypeScript類型定義
- **現代化API**: 使用Fetch API、Intersection Observer等

## 📁 檔案結構

```
├── home/
│   ├── index.html          # 首頁
│   ├── home.css           # 首頁樣式
│   ├── home.ts            # 首頁邏輯
│   └── home.js            # 編譯後的JavaScript
├── about/
│   ├── about.html         # 關於我頁面
│   ├── about.css          # 關於我樣式
│   ├── about.ts           # 關於我邏輯
│   └── about.js           # 編譯後的JavaScript
├── travel/
│   ├── travel.html        # 旅行頁面
│   ├── travel.css         # 旅行樣式
│   ├── travel.ts          # 旅行邏輯
│   └── travel.js          # 編譯後的JavaScript
├── contact/
│   ├── contact.html       # 聯絡頁面
│   ├── contact.css        # 聯絡樣式
│   ├── contact.ts         # 聯絡邏輯
│   └── contact.js         # 編譯後的JavaScript
├── src/
│   ├── navbar-config.ts   # 導航欄配置
│   ├── footer-config.ts   # 頁腳配置
│   └── [圖片檔案]         # 個人照片和旅行照片
├── tsconfig.json          # TypeScript配置
└── README.md              # 說明文件
```

## 🚀 使用方式

### 開發環境設置
1. **克隆專案**:
   ```bash
   git clone [專案網址]
   cd [專案目錄]
   ```

2. **TypeScript編譯**:
   ```bash
   tsc
   ```

3. **本地伺服器**:
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx serve .
   ```

4. **開啟網站**: 瀏覽器訪問 `http://localhost:8000/home/index.html`

## 🎯 頁面功能詳解

### 首頁 (Home)
- **個人卡片**: 大頭照、姓名、動態標題輪播
- **標題動畫**: 自動切換「臺灣大學資訊管理學系」、「SITCON2025行銷組」、「努力賺錢中」
- **興趣標籤**: 投資小白、網頁開發、資料分析、魔術、排球、攝影、桌遊
- **社交連結**: Email、GitHub、LinkedIn、Instagram

### 關於我 (About)
- **聯絡資訊**: 電子郵件、電話、地址、社交媒體（含複製功能）
- **技能展示**: 
  - Hard Skills: Python、C/C++、R、JavaScript、Node.js、Git
  - Soft Skills: 投資理財、團隊協作、專案管理、溝通協調、解決問題
- **學歷背景**: 成功高中、臺灣大學資訊管理學系
- **工作經驗**: 資管營工人、宿營工人、SITCON2025行銷組、補習班魔術助教、家教老師、研究助理
- **興趣愛好**: 排球、桌遊、攝影（含懸停提示）

### 旅行 (Travel)
- **日本之旅 (2025.06)**: 大阪京都自由行，環球影城、萬國博覽會
- **香港澳門 (2025.08)**: 家庭旅遊，港式美食、葡式建築、賭場體驗
- **澳洲計畫 (2026.07)**: 未來行程，雪梨、墨爾本、大堡礁（Coming Soon）
- **互動功能**: 點擊卡片開啟詳細模態視窗，包含照片集、行程亮點、Google地圖

### 聯繫 (Contact)
- **聯絡方式**: 電子郵件、電話、GitHub、LinkedIn
- **訊息表單**: 姓名、郵件、主旨、訊息內容
- **表單驗證**: 即時驗證和錯誤提示

## 🎨 自訂化指南

### 更換個人資訊
1. 編輯各頁面HTML中的文字內容
2. 更新個人卡片中的姓名、學校、技能標籤
3. 修改工作經驗和學歷資訊

### 添加個人照片
1. 將照片放入 `src/` 資料夾
2. 更新HTML中的圖片路徑
3. 調整CSS中的圖片尺寸和樣式

### 修改顏色主題
編輯CSS文件中的顏色變數：
```css
:root {
  --primary-color: #550000;
  --background-color: #FAF0E6;
  --text-color: #333;
  --accent-color: #f39c12;
}
```

### 添加新的旅行目的地
1. 在 `travel.html` 中添加新的目的地卡片
2. 創建對應的模態視窗
3. 在 `travel.ts` 中更新導航邏輯
4. 添加照片到 `src/` 資料夾

## 🌙 深色模式

網站支援深色/淺色主題切換：
- 點擊導航欄右側的月亮/太陽圖標
- 主題偏好會自動保存到本地儲存
- 支援所有頁面和組件

## 📱 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔧 開發說明

### TypeScript 編譯
```bash
# 編譯所有TypeScript文件
tsc

# 監聽文件變化自動編譯
tsc --watch
```

### 主要類別架構
- **共用類別** (script.ts):
  - `Navigation`: 頁面導航和移動選單
  - `ThemeToggle`: 深色/淺色主題切換
  - `ScrollAnimations`: 滾動淡入動畫
  - `SkillAnimator`: 技能進度條動畫
  - `ContactForm`: 表單驗證和提交
  - `CardAnimations`: 卡片懸停效果

- **頁面專用類別**:
  - `TitleAnimation` (home.ts): 首頁標題輪播動畫
  - `DestinationNavigation` (travel.ts): 旅行頁面模態視窗管理
  - `AboutScrollAnimations` (about.ts): 關於頁面滾動動畫
  - `ContactScrollAnimations` (contact.ts): 聯絡頁面滾動動畫

### 模組化設計
- 每個頁面有獨立的HTML、CSS、TypeScript文件
- 共用組件由首頁統一管理
- TypeScript提供類型安全和更好的開發體驗

## 📞 聯絡資訊

- **電子郵件**: chenjustin824@ntu.im
- **GitHub**: [chennjustin](https://github.com/chennjustin)
- **LinkedIn**: [Hung-Chi Chen](https://www.linkedin.com/in/hung-chi-chen-b82b86369/)
- **電話**: 0963617655

## 📝 更新日誌

### v1.0.0 (2025.01)
- 初始版本發布
- 完成四頁面架構
- 實現響應式設計
- 添加TypeScript支援
- 完成旅行模態視窗功能

---

© 2025.09 陳竑齊. 保留所有權利.