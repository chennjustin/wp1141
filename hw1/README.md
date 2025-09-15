# 陳竑齊（Hung‑Chi, Justin）個人網站

全站使用 HTML、CSS 與 TypeScript 實作，並支援深色/淺色主題。

## 內容導覽

- 首頁 Home：名片式自我介紹與動態標題
- 關於我 About：聯絡資訊、硬軟實力、學歷、經歷、興趣
- 旅行 Travel：日本、香港與澳門的旅行紀錄（含圖文與亮點）
- 聯繫 Contact：常用聯絡方式與表單（含即時驗證）

## 網站特色與互動

- 主題切換：支援深色/淺色模式，會記住偏好
- 平滑動畫：進場淡入、卡片懸停、標題輪播、時間軸/模態切換
- 模態視窗：旅行目的地詳情以模態呈現，帶旗幟、亮點與相片牆
- 表單體驗：即時欄位驗證、錯誤提示、送出成功提醒
- 複製便捷：在 About 可一鍵複製 Email/電話
- 響應式設計（開發中）：桌機、平板、手機皆可舒適閱讀
- 中英切換：開發中

## 網站文案與故事

### 首頁 Home

- 名稱與標題：
  - 陳竑齊（Hung‑Chi Chen）
  - 標題輪播：「臺灣大學資訊管理學系」「SITCON2025行銷組」「努力賺錢中」
- 自介重點：
  - 練習不被內卷影響，維持自己的步調
  - 對資訊技術、網頁開發、資料分析、量化與心理學有興趣
  - 研究助理的學習與合作經驗
- 興趣標籤：投資小白、網頁開發、資料分析、魔術、排球、攝影、桌遊

### 關於我 About

- 聯絡資訊：Email、電話、GitHub、LinkedIn，支援複製按鈕
- Hard Skills：Python、C/C++、R、Latex、Web Development、Node.js、Git
- Soft Skills：投資理財、團隊合作、專案管理、溝通協調、解決問題
- 學歷：成功高中（2020–2023）、臺灣大學資訊管理學系（2023–2027）
- 個人陳述：喜歡排球/攝影/桌遊/收集吊飾；正在學會用自己的節奏做事，擅長團隊協作與專案管理
- 活動與經驗（節錄）：
  - 2024 資管營隊輔組（Sep.2023–Feb.2024）
  - 2024 宿營攝影組（Apr.2024–Aug.2024）
  - 2025 資管營活動組（Sep.2024–Feb.2025）
  - DevFest Taipei 2024 與會者（Nov.2024）
  - 2024 TSMC IT CareerHack 台積電校園黑客松（Feb.2025）
  - SITCON2025 行銷組（Sep.2024–Mar.2025）
  - 魔術課助教（Jun.2025–Sep.2025）
- 興趣：採用「小型徽章」的極簡呈現（排球、桌遊、攝影），更俐落不占版面

### 旅行 Travel

- 日本 Osaka & Kyoto（2025/06）
  - 卡片摘要：「第一次不是和家人出國，是和朋友一起的旅程…」
  - 模態亮點：環球影城玩到晚、萬國博覽會、同伴醉到在樓梯間溜滑梯、吃遍日本、飛機故障多留一天大阪
  - 相片：`jp1–jp11.jpg`
- 香港與澳門（2025/08）
  - 卡片摘要：「成為導遊的港澳六天五夜…」
  - 模態亮點：港式燒臘與冰室、蛋塔巡禮、解決一家大小食衣住行、葡式建築與奢華賭場、氹仔的繁華
  - 相片：`hm (1)–(7).jpg`
- 澳洲（2026/07, Coming Soon）
  - 計畫亮點：雪梨歌劇院、墨爾本咖啡文化、大堡礁潛水、袋鼠與考拉、大洋路自駕、黃金海岸

### 聯繫 Contact

- 四類卡片（Email/Phone/GitHub/LinkedIn），並有「發送郵件/撥打電話/前往 GitHub/查看檔案」等快速動作
- 訊息表單欄位：姓名、Email、主旨、訊息
- 互動：即時驗證、錯誤顯示、送出成功提示並重置表單

## 介面與動線

- 導航列：固定於頂端，滾動會改變樣式；手機為漢堡選單
- Navbar/Footer：非首頁頁面會自動載入首頁的 Navbar/Footer，確保風格一致
- 動畫節奏：元素淡入、卡片升起、圖示縮放、點點同步，讓閱讀不打擾但有層次

## 技術與實作

- HTML/CSS：語義化標記、CSS 變數、Grid/Flex、自訂動畫、RWD
- TypeScript：頁面模組（home.ts、about.ts、travel.ts、contact.ts），與共用腳本（navbar-config.ts、footer-config.ts）
- IntersectionObserver：滾動進場與時間軸/卡片動畫觸發
- LocalStorage：主題偏好保存
- 注意：語言切換已移除，所有文案直接寫在 HTML（避免多語程式邏輯，管理更單純）

## 專案結構

```
hw1/
├── home/               首頁（index.html、home.css、home.ts/js）
├── about/              關於我（about.html、about.css、about.ts/js）
├── travel/             旅行（travel.html、travel.css、travel.ts/js）
├── contact/            聯繫（contact.html、contact.css、contact.ts/js）
├── src/                共用資源（navbar-config.ts/js、footer-config.ts/js、圖片）
├── tsconfig.json
└── README.md
```

## 在本機開啟（可再home的資料夾找到index.html）

1) 安裝 TypeScript 並編譯：

```bash
cd hw1
npx tsc
```

2) 啟動簡單伺服器：

```bash
python -m http.server 8000
# 或
npx serve .
```

3) 瀏覽 `http://localhost:8000/hw1/home/index.html`

## 自訂化建議

- 修改文案：直接編輯各頁面的 HTML 文字
- 更換相片：把檔案放到 `hw1/src/` 並更新對應路徑
- 新增旅行：於 `travel.html` 新增卡片與模態、相片與亮點，必要時在 `travel.ts` 綁定互動
- 調色：調整 `about.css/home.css/travel.css/contact.css` 冒頭的 CSS 變數（`--primary-color` 等）

## 聯絡方式

- Email：chenjustin824@ntu.im
- GitHub：chennjustin
- LinkedIn：Hung‑Chi Chen
- Phone：0963617655

---

© 2025.09 陳竑齊. 保留所有權利.
