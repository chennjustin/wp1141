# 專案開發問題記錄

_Cinema Booking System 開發過程中的需求與問題_

---

## 問題 1

你是一個熟悉 React.ts、Vite、TailwindCSS、Shadcn UI、以及前端狀態管理的工程師。
接下來我要做一個「電影院訂票與選位系統」的純前端網頁服務作業，符合以下規則：

1️⃣ 專案說明
- 使用者可以瀏覽目前上映的電影（電影資料來自 `/public/data/movies.csv`）。
- 每部電影會有對應的播放廳（`/public/data/halls.csv`）與場次（`/public/data/screenings.csv`）。
- 使用者可以瀏覽電影資訊、選擇場次與座位，並將選擇加入「購物車」。
- 「購物車」代表還沒正式送出，可隨時增減或修改。
- 「送出訂單」後，會顯示確認頁（純前端暫存於 state，不需後端或金流）。

2️⃣ 專案架構
請使用 Vite + React + TypeScript 建立。
Styling 用 TailwindCSS，UI 元件建議使用 Shadcn UI。
資料來源為 public/data 下的三個 CSV 檔。
請在專案初始化時建立以下主要資料夾架構：
src/
├── components/
├── pages/
├── hooks/
├── context/
├── utils/
├── App.tsx
├── main.tsx
public/
├── data/
├── movies.csv
├── halls.csv
└── screenings.csv

3️⃣ 功能模組（稍後分步建立）
- MovieList：顯示所有電影與搜尋功能
- MovieDetail：顯示電影資訊與可選場次
- SeatSelection：顯示座位圖供選擇
- Cart：顯示目前暫存的選擇（可刪改）
- Checkout：確認送出訂單

4️⃣ 狀態管理
請先規劃 `MovieContext` 以共享電影資料與選取資訊（稍後再實作）。

請先幫我：
- 初始化專案（Vite + React + TypeScript）
- 加入 TailwindCSS 與 Shadcn UI
- 在 `src/` 下建立上述資料夾
- 並生成一個基本的 App.tsx 結構（含簡單導覽列 NavBar、頁面路由占位）
- 不用實作功能，只要讓整個專案能跑起來並顯示「Cinema Booking System」首頁即可

---

## 問題 2

接下來我要讓這個電影院訂票系統可以從 CSV 檔載入資料並顯示電影清單。

🎯 目標：
請幫我實作「MovieList」頁面，能自動從 `/public/data/movies.csv` 載入資料，
顯示電影的海報、名稱、片長、分級、簡介與「查看場次」按鈕。

---

🧩 實作步驟

1️⃣ 安裝套件：
請幫我加入 `papaparse` 用於讀取 CSV，並建立 `src/utils/csvLoader.ts`：
- 定義一個通用函式 `loadCSV<T>(path: string): Promise<T[]>`
- 使用 `fetch` 從 public 路徑抓取 CSV，再用 Papa.parse 轉成 JSON 陣列
- 自動忽略空白列與空欄位

2️⃣ 在 `src/context/MovieContext.tsx`：
- 建立 `MovieContext` 與 `MovieProvider`
- 在 `useEffect` 中載入 movies.csv、screenings.csv、halls.csv 三個檔案
- 將它們存在 context state 中，讓全域皆可使用
- 暫時不處理錯誤，只要在載入時顯示一個簡單的 loading 畫面即可

3️⃣ 在 `src/pages/MovieList.tsx`：
- 從 context 取出 movies 資料
- 使用 Tailwind 與 Shadcn UI（例如 Card 組件）美化列表
- 每部電影顯示：
  - 海報（poster_url）
  - 片名（title）
  - 類型與片長（genre + duration）
  - 分級（rating）
  - 簡介（description，超過 120 字以省略號截斷）
  - 「查看場次」按鈕（暫時只要能跳轉到 `/movie/:id` 頁即可）

4️⃣ 搜尋功能：
- 在頁面頂部加入一個輸入框（SearchBar）
- 可以輸入關鍵字即時篩選電影名稱或類型（前端篩選即可）

5️⃣ Routing：
- 在 `App.tsx` 新增路由：`/movies` 對應 `MovieList` 頁面
- 在首頁導覽列加上「Movies」按鈕可以進入 `/movies`

---

💅 UI 建議（Shadcn + Tailwind）
- 使用 `<Card>` 顯示每部電影
- Grid layout 每列 3 或 4 部電影
- 搜尋框可使用 `<Input>` + `<Search>` icon
- Loading 狀態使用 `<Skeleton>` 或簡單文字 “Loading movies...”

---

✅ 驗收條件：
- 跑起來後進入 `/movies` 可以看到 10 部電影清單
- 搜尋可以即時篩選
- 點擊「查看場次」能正確跳到 `/movie/:id`（稍後再實作座位選取頁）

---

## 問題 3

接下來我要實作「電影詳情 + 場次選位頁面」，也要新增購物車功能。

🎯 目標：
使用者點擊「查看場次」後，會進入 `/movie/:id` 頁面，
可以：
1. 查看電影詳細資訊
2. 選擇想要的日期與時間
3. 選取座位（依據廳別座位表）
4. 加入購物車（可多筆）
5. 隨時打開購物車查看或修改

---

🧩 實作步驟

1️⃣ 建立 `src/pages/MovieDetail.tsx`：
- 從 URL 取得 movieId（useParams）
- 從 context 找出該電影資料
- 顯示電影詳細資訊（大圖、片名、分級、片長、簡介）
- 下面顯示可選場次（篩選 screenings 中該 movieId 的資料）
- 場次列表以日期分組，按鈕列出所有時間可選

2️⃣ 點擊某個場次按鈕後：
- 進入座位選取模式（同頁可展開顯示）
- 顯示簡化版座位圖：
  - 可用座位為灰色、已選為藍色、已售出（隨機模擬）為紅色
  - 點擊可切換選取狀態
- 使用 Tailwind Grid 呈現，例如 10x10（共100個座位）
- 已選座位會顯示在頁面下方

3️⃣ 加入購物車功能：
- 建立 `CartContext`（放在 `src/context/CartContext.tsx`）
- Cart 結構：

{
movieTitle: string,
hallName: string,
date: string,
time: string,
seats: string[],
totalPrice: number
}

- `addToCart()`：將目前選取的電影、場次、座位加入購物車
- `removeFromCart(index)`：刪除某筆項目
- `clearCart()`：清空購物車
- 使用 local state 暫存（不需後端）

4️⃣ 建立 `src/pages/Cart.tsx`：
- 顯示目前購物車內容，每一筆顯示：
- 電影名稱 + 場次 + 座位
- 總價（例如每張票固定 NT$250）
- 刪除按鈕
- 下方有「送出訂單」按鈕，會導向 `/checkout`

5️⃣ 在 NavBar 新增購物車按鈕（右上角顯示目前筆數徽章）
- 點擊可前往 `/cart`

6️⃣ Routing：
- `/movie/:id` → MovieDetail
- `/cart` → Cart

---

💅 UI 建議
- 使用 Shadcn 的 `<Card>` 顯示電影資訊
- 使用 `<Badge>` 標示分級
- 日期/時間用 `<Select>` 或 `<ButtonGroup>` 呈現
- 座位圖用 Tailwind grid: `grid grid-cols-10 gap-1`
- 已選座位顯示在頁面底部以 `<Tag>` 呈現
- 「加入購物車」按鈕固定在頁面底部或右下角浮動顯示

---

✅ 驗收條件：
- 點「查看場次」→ 正確跳入 `/movie/:id`
- 能選日期、時間並看到座位圖
- 能點選座位並加到購物車
- `/cart` 顯示所有已選項目並可刪除
- 「送出訂單」按鈕可導向 `/checkout`（稍後實作）

---

🧠 Tips
- 為簡化，座位售出狀態可隨機生成 10–15% 隨機 disable
- 每選一個座位立刻更新總價
- 使用 Context 讓購物車全域共享

---

## 問題 4

接下來我要進行 UX 改版與 Checkout 頁面的實作。

🎯 目標：
1️⃣ 改善 UX：
   - 點擊「查看場次」後，不要在同一頁底部展開座位圖。
   - 改成跳轉到新的頁面 `/movie/:id/select-seat` 顯示完整座位選擇畫面。
   - 使用者在那頁選完座位後可按「加入購物車」返回首頁或購物車。
2️⃣ 新增 Checkout 頁面：
   - 顯示使用者的最終訂單內容。
   - 使用者可確認資訊並模擬送出訂單。
3️⃣ 改進購物車 UX：
   - 在購物車中，使用者可以直接修改座位或人數（即重新選位）。

---

🧩 實作步驟

### 1️⃣ 新頁面：`src/pages/SeatSelection.tsx`
- 路由：`/movie/:id/select-seat`
- 從 `useParams()` 取得 movieId。
- 從 context 取得該電影資訊與可用場次。
- 使用者需先選「日期與時間」，然後出現座位圖。
  - 點擊切換狀態。
- 下方顯示：
  - 已選座位（以 Tag 顯示）
  - 總價（例如每張票 NT$250）
  - 「加入購物車」按鈕（按下後會：
      - 呼叫 `addToCart(movieId, hallId, date, time, selectedSeats)`
      - 導向 `/cart` 頁面）

---

### 2️⃣ 購物車功能強化 (`src/pages/Cart.tsx`)
- 每筆項目可顯示：
  - 電影名稱 + 日期時間 + 座位 + 金額。
- 在每筆項目旁邊新增：
  - 「修改座位」按鈕 → 點下去會導向 `/movie/:id/select-seat?edit=true`
    （在 SeatSelection 頁面可辨識此 query 參數，預載該筆項目的舊資料）
  - 「刪除」按鈕。
- 若使用者修改座位並返回購物車，舊資料要更新而非重複新增。
  - 提示：可在 `CartContext` 中新增 `updateCartItem(index, newSeats)`。

---

### 3️⃣ Checkout 頁面 (`src/pages/Checkout.tsx`)
- 路由：`/checkout`
- 顯示所有購物車項目：
  - 電影名稱、廳別、日期時間、座位、金額。
- 總價顯示在最下方。
- 「確認送出訂單」按鈕 → 按下後：
  - 模擬送出（顯示成功訊息）
  - 清空購物車
  - 跳轉回首頁 `/`
- 可使用 Shadcn 的 `<Card>` + `<Button>` + `<Alert>` 元件打造簡潔畫面。

---

### 4️⃣ Routing 更新 (`App.tsx`)
請確認目前有以下路由：

/movies → MovieList
/movie/:id → MovieDetail
/movie/:id/select-seat → SeatSelection
/cart → Cart
/checkout → Checkout


---

💅 UI/UX 建議
- SeatSelection 頁面全螢幕顯示，最上方顯示電影資訊與場次選擇。
- 座位圖中「螢幕」可在頂部以灰條顯示。
- 「加入購物車」按鈕固定在底部（sticky footer）。
- 在購物車中修改座位時，保留原先的 movieId 與場次。
- Checkout 頁面送出後以 Shadcn 的 `<Alert>` 顯示「✅ 訂單已送出」。

---

✅ 驗收條件
- 「查看場次」→ 正確導向 `/movie/:id/select-seat`
- 可以完整選位並加入購物車。
- 購物車能修改座位或刪除項目。
- Checkout 頁面能正確顯示所有資訊並送出。
- 送出後購物車清空，回首頁顯示成功畫面。

---

🧠 實作提示
- 修改座位時可使用 `location.state` 或 query string (`?edit=true`) 傳遞原始資料。
- 若 edit 模式啟動，SeatSelection 頁面需預設 highlight 舊座位。
- 在 CartContext 中補上：
  - `updateCartItem(index: number, newData: Partial<CartItem>)`
  - `clearCart()`

---

## 問題 5

請幫我修改目前的 UX 流程，讓整個電影→場次→座位的體驗變得更順暢。

---

🎯 主要需求：
目前在 `/movie/:id/select-seat` 頁面仍然會再次出現「場次選擇區塊」，但這是不需要的。
我希望流程變成：

1️⃣ 使用者在 `/movie/:id` 頁面就選好場次（日期與時間）。
2️⃣ 按下「選擇座位」按鈕後，跳轉到 `/movie/:id/select-seat`。
3️⃣ `/select-seat` 頁面只顯示「座位選擇」畫面，不要再顯示場次表。
4️⃣ 同時需要知道使用者是從哪一個場次進來的（要傳遞場次資訊）。

---

🧠 具體修改建議：

1️⃣ **在 `/movie/:id` 頁面 (MovieDetail.tsx)**  
   - 當使用者選擇好某個場次（date, time, hall, price）並按下「選擇座位」：
     - 直接 `navigate(`/movie/${movieId}/select-seat`, { state: { selectedShow } })`
     - `selectedShow` 內容包含：
       ```
       {
         movieId,
         movieTitle,
         hallId,
         hallName,
         date,
         time,
         price,
         type
       }
       ```
   - 不要在這頁出現座位圖。

2️⃣ **在 `/movie/:id/select-seat` 頁面 (SeatSelection.tsx)**  
   - 接收來自 `useLocation().state` 的 `selectedShow`。
   - 如果沒有 state，就導回 `/movie/:id`（防止使用者直接輸入網址進來）。
   - 用 `selectedShow` 的資訊顯示標題列：
     - 電影名稱、場次時間、廳別、版本 (2D / 3D)。
   - 座位圖照舊：顯示 10x10 grid。
   - 不要再顯示任何場次選擇按鈕。

3️⃣ **在購物車中修改座位功能（同時更新 UX）**
   - 當使用者在購物車頁面點擊「修改座位」時：
     - 跳轉到 `/movie/:id/select-seat`，並透過 `{ state: { editMode: true, selectedShow, cartIndex } }` 傳遞資料。
   - `SeatSelection` 頁面如果偵測到 `editMode === true`：
     - 預先標記舊座位（selectedSeats）。
     - 修改完成後呼叫 `updateCartItem(cartIndex, newSeats)`。
     - 導回購物車頁。

---

💅 UI 提示：
- `/movie/:id` → 以日期為群組的場次卡片（按鈕「選擇座位」會跳頁）
- `/movie/:id/select-seat` → 只顯示座位圖 + 場次資訊列
- 座位圖上方可顯示：

- 下方固定「加入購物車」按鈕（sticky footer）

---

✅ 驗收條件：
- `/movie/:id` 頁面能選擇場次並跳轉。
- `/movie/:id/select-seat` 不再顯示場次表，只顯示座位圖。
- 能正確接收上一頁傳遞的 `selectedShow`。
- 修改購物車座位功能仍可使用，流程一致。

---

## 問題 6

SeatSelection的頁面會直接黑屏，然後回頭的話也不行，就直接爆掉了

---

## 問題 7

接下來我要完成整個電影院訂票系統的收尾，包括 Checkout 成功畫面、歷史訂單紀錄、以及熱門電影統計。

---

🎯 目標：
1️⃣ 讓 /checkout 頁面可以模擬送出訂單並顯示成功動畫。
2️⃣ 把已送出的訂單存到 localStorage （做為歷史紀錄）。
3️⃣ 建立一個 /history 頁面，可以瀏覽所有歷史訂單。
4️⃣ 在首頁顯示「熱門電影統計」（例如哪部電影被訂最多張票）。

---

🧩 實作步驟

### 1️⃣ 更新 Checkout 頁面
- 路由： /checkout
- 畫面顯示：
  - 所有購物車項目（電影、廳、場次、座位、金額）
  - 總金額（加總全部座位價格）
  - 「確認送出訂單」按鈕
- 按下後：
  - 建立一筆 order 物件：
    ```
    {
      orderId: uuid(),
      timestamp: new Date().toISOString(),
      items: cartItems,  // from CartContext
      total: totalPrice
    }
    ```
  - 存入 localStorage 的 "cinema_orders" key 中（以陣列形式 append）
  - 清空購物車 (`clearCart()`)
  - 顯示成功動畫（可以用 Framer Motion 或簡單 fade in/out 卡片）
  - 3 秒後自動導向 /history 頁面

---

### 2️⃣ 新增 歷史訂單頁 HistoryPage.tsx
- 路由： /history
- 從 localStorage 讀取 "cinema_orders" 。
- 如果沒有訂單顯示空狀態：「目前沒有歷史訂單」
- 否則：
  - 用 Card 逐筆顯示：
    - 訂單日期（格式化 yyyy /MM /dd  HH:mm）
    - 每筆電影、場次、座位資訊
    - 小計與總金額
  - 最上方顯示訂單編號（orderId 縮短版）

---

### 3️⃣ 統計熱門電影
- 在 App 首頁（或 MovieList 頂部）加入「本週熱門電影」區塊。
- 從 localStorage 載入所有歷史訂單。
- 統計各 movieTitle 出現的座位數（即票數）。
- 取前 3 名顯示：
  - 海報、名稱、票數
  - 可用 shadcn 的 Card + Progress bar 呈現。
- 若無資料則顯示「尚無統計資料」。

---

### 4️⃣ Routing 更新
請確認 App.tsx 中已有：

/movies
/movie/:id
/movie/:id/select-seat
/cart
/checkout
/history


並在 NavBar 新增「歷史訂單」按鈕。

---

💅 UI 建議
- Checkout 成功畫面可用：

✅ 訂單已送出！
感謝您的訂購，請至「歷史訂單」查看紀錄。

- 可加入 🎉 icon 或 confetti 動畫（Framer Motion + CSS transition）
- History 頁面可讓每筆訂單 Card 可折疊/展開（Accordion）

---

✅ 驗收條件
- 按下 「確認送出訂單」 後：
- 顯示成功動畫
- 清空購物車
- 寫入 localStorage (cinema_orders)
- 3 秒後導向 /history
- /history 能顯示所有歷史訂單與時間。
- 首頁或 /movies 頁面能顯示統計出的熱門電影。
- 重新整理頁面後資料仍在（因為存在 localStorage）。

然後不要在寫新的markdown了，維護ReadMe就好

---

## 問題 8

他現在完全看不到欸，閃退了

---

## 問題 9

我要針對目前的 Cinema Booking System 進行五項整體收尾優化，  
不要新增新功能頁，只需改進現有架構與 UX。  
請幫我完成以下內容：

---

### 1️⃣ 「送出記錄」後的 UX 邏輯
- 當使用者在 /checkout 送出訂單成功後：
  - 清空購物車 (`clearCart()`)，防止繼續修改。
  - 若使用者再訪 /cart，顯示提示訊息：
    「目前沒有可修改的訂單，如需更改請重新選購。」
  - 可以使用 Shadcn `<Alert>` 或簡單的卡片提示。
  - 若購物車為空，隱藏送出按鈕。

---

### 2️⃣ CSV 資料更新的熱重載
- 確保更改 `/public/data/*.csv` 檔後可自動重新載入。
- 若 Vite hot reload 沒有偵測到變化，請在 MovieContext 加入手動刷新機制：
  - 在右上角 NavBar 新增一個「↻ 重新載入資料」按鈕。
  - 點擊後呼叫 `loadAllData()`：
    - 重新 fetch 三個 CSV（movies, screenings, halls）
    - 更新 context state。
  - 加入 loading 狀態（e.g. “資料重新載入中...”）。
  - 此功能只影響前端 state，不需重新整理頁面。

---

### 3️⃣ UI 邏輯一致性
- 在購物車修改座位後：
  - 更新完成顯示成功訊息（toast / alert：「座位已更新！」）
  - 若使用者按「取消修改」返回購物車，也應保留原資料。
- 在 Checkout 頁面：
  - 加入「返回購物車」按鈕。
  - 若購物車為空，顯示「購物車目前沒有任何項目」。
- 所有按鈕的文字與行為一致（例如「加入購物車」、「修改座位」、「送出訂單」）。

---

### 4️⃣ 資料結構優化
- 在 MovieContext 中重新封裝載入後的資料結構，  
  使得每部電影能直接附帶場次與廳資料：

{
id: '1001',
title: 'Skydrift',
genre: ['Action', 'Sci-Fi'],
rating: '保護級',
duration: 118,
halls: [
{
hallId: 'A',
hallName: 'Hall A',
screenings: [
{ date, time, price, type }
]
}
]
}
- 讓 `MovieDetail` 直接讀取這個結構來渲染場次，不需再每次 filter()。
- 更新相關 hooks / props 以支援這個整合資料。

---

### 5️⃣ NavBar 與 Breadcrumb
- 在 NavBar 下方新增一條 breadcrumb 導覽列，顯示目前位置。
例如：
- `/movies` → 「電影列表」
- `/movie/:id` → 「電影列表 > {電影名稱}」
- `/movie/:id/select-seat` → 「電影列表 > {電影名稱} > 選擇座位」
- `/cart` → 「購物車」
- `/checkout` → 「結帳」
- `/history` → 「歷史訂單」
- 可以用簡單 Tailwind + React Router 的 useLocation() + params 生成。
- Breadcrumb 應自動偵測路由顯示，並提供返回上一頁功能。

---

✅ 驗收條件：
- 購物車清空後不可再修改。
- 重新載入 CSV 功能運作正常。
- 修改座位與取消操作 UX 一致。
- 資料結構整合後能正確渲染場次。
- Breadcrumb 正確顯示路徑與電影名稱。

---

🧠 提示：
- Breadcrumb 可放在 `src/components/BreadcrumbNav.tsx`
- MovieContext 的整合建議：
- 先載入三個 CSV，再用 reduce() 整併為 nested 結構。
- 每次 CSV 重新載入時自動覆蓋舊 state。
- 「重新載入資料」按鈕可用 Shadcn `<Button variant="outline">↻ 重新載入資料</Button>`

---

