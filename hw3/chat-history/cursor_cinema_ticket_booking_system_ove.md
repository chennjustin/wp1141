# 專案開發問題記錄

_Cinema Booking System 開發過程中的需求與問題_

---

## 問題 1

你是一個熟悉 React.ts、Vite、TailwindCSS、Shadcn UI、以及前端狀態管理的工程師。
接下來我要做一個「電影院訂票與選位系統」的純前端網頁服務作業，符合以下規則：

簡單的說明

- 使用者可以瀏覽目前上映的電影（電影資料來自 `/public/data/movies.csv`）。
- 每部電影會有對應的影廳（`/public/data/halls.csv`）與場次（`/public/data/screenings.csv`）。
- 使用者可以瀏覽電影然後選擇場次與座位，確認後可以選擇加入購物車。
- 購物車不代表正式送出，可以隨時修改。
- 送出訂單後，會顯示確認頁面（現在只是要做純前端暫存於 state，不用搞後端跟金流）。

架構
使用 Vite + React + TypeScript 建立。
Styling 用 TailwindCSS，UI 用 Shadcn UI。
資料來源是 public/data 下的三個 CSV 檔，我已經放好了，你可以看一下。
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

模組（等等再做）

- MovieList：所有電影和搜尋功能
- MovieDetail：電影資訊和場次(要有時間跟影廳)
- SeatSelection：座位圖
- Cart：目前暫存的選擇
- Checkout：送出訂單

請先幫我：1. 初始化專案（Vite + React + TypeScript）2. 加入 TailwindCSS 與 Shadcn UI 3. 在 `src/` 下建立上述資料夾 4. 生成一個基本的 App.tsx 5. 不用實作功能，先讓專案能跑起來並顯示 Cinema Booking System

---

## 問題 2

接下來我要讓這個電影院訂票系統可以從 CSV 檔載入資料並顯示電影清單。請幫我實作MovieList 頁面，能自動從 `/public/data/movies.csv` 載入資料，像是電影的海報、名稱、片長、分級、簡介。

---

安裝套件：

加入 `papaparse` 用於讀取 CSV，建立 `src/utils/csvLoader.ts`：

- 定義一個通用函式 `loadCSV<T>(path: string): Promise<T[]>`

然後在 `src/context/MovieContext.tsx` 建立 `MovieContext` 與 `MovieProvider`，然後用 `useEffect` 中載入 movies.csv、screenings.csv、halls.csv 三個檔案

每一部電影要顯示：

海報（poster_url）

片名（title）

類型與片長（genre + duration）

分級（rating）

簡介（description，超過 120 字以省略號截斷）

然後我要在頁面頂部加入一個 SearchBar，可以輸入關鍵字即時篩選電影名稱或類型

做完之後請幫我驗收：

1. 跑起來後進入 `/movies` 可以看到 10 部電影清單
2. 搜尋可以即時篩選
3. 點擊「查看場次」能正確跳到相對應的電影頁面

---

## 問題 3

接下來我想實作電影詳情 + 場次選位頁面+購物車。

使用者點擊「查看場次」後，會進入 `/movie/:id` 頁面，可以：

1. 查看電影詳細資訊
2. 選擇想要的日期與時間
3. 選取座位然後加入購物車（可以很多筆）
4. 購物車裡面可以修改

---

妳要建立 `src/pages/MovieDetail.tsx` 然後從 URL 取得 movieId，然後顯示電影詳細資訊

下面顯示可選場次，然後點擊某個場次按鈕，要進入座位選取模式，這時候顯示座位圖，例如 10x10（共100個座位），且已選座位會顯示在頁面下方

加入購物車功能(在 NavBar 新增購物車按鈕))：
Cart 結構：{

movieTitle: string,
hallName: string,
date: string,
time: string,
seats: string[],
totalPrice: number
}

建立 `src/pages/Cart.tsx` 用它來顯示購物車內容，包刮電影名稱 + 場次 + 座位+總價（每張票固定 NT$250之類的）+刪除按鈕

下方有送出訂單按鈕，會導向 `/checkout`

---

## 問題 4

接下來我要進行 UX 改版跟 Checkout。

點擊「查看場次」後，不要在同一頁底部展開座位圖，改成跳轉到新的頁面後顯示座位選擇畫面，然後使用者在那頁選完座位後可按「加入購物車」返回首頁或購物車。

### 加強Cart

- 每筆項目顯示：電影名稱 + 日期時間 + 座位 + 金額
- 要有修改座位按鈕和刪除按鈕。
- 若使用者修改座位並返回購物車，舊資料要更新

### Checkout 頁面

要顯示所有購物車項目，像是電影名稱、廳別、日期時間、座位、金額(總價在最下面)

確認送出訂單按鈕按下後要顯示成功訊息然後清空購物車。

## 問題 5

目前在 `/movie/:id/select-seat` 頁面仍然會再次出現「場次選擇區塊」，但這是不需要的。

我希望流程變成：

1. 使用者在 `/movie/:id` 頁面就選好場次（日期與時間）
2. 按下選擇座位按鈕後，跳轉到 `/movie/:id/select-seat`
3. `/select-seat` 頁面只顯示座位選擇，不要再顯示場次表

## 問題 6

SeatSelection的頁面會直接黑屏，然後回頭的話也不行，就直接爆掉了

---

## 問題 7

接下來我要完成訂票系統的Checkout 畫面和歷史訂單紀錄，讓 /checkout 頁面可以模擬送出訂單並顯示成功動畫，並把已送出的訂單存到 localStorage 當作歷史紀錄

歷史訂單就是去/history看

## 問題 8

針對目前的專案優化：不要新增新功能頁，只要改進現有架構與 UX：當使用者在 /checkout 送出訂單成功後：

清空購物車防止繼續修改

在進入購物車時要顯示：目前沒有可修改的訂單

### UI 邏輯一致性

- UI邏輯也要改：在購物車修改座位後：如果使用者按取消修改返回購物車，要保留原資料。
