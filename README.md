# QR Code 瓶蓋刮刮樂活動 Demo

純前端示意網站，模擬飲料瓶蓋 QR Code 刮刮樂抽獎活動流程。

## 檔案結構

```
QR_Demo/
├── index.html      ← 主頁面（SPA，5 個頁面狀態）
├── style.css       ← 手機版優先樣式
├── app.js          ← 所有邏輯（抽獎、刮刮樂、localStorage）
├── images/         ← 獎品圖片目錄（放入 prize_01~06.png）
└── README.md
```

## 技術規格

- HTML / CSS / Vanilla JavaScript（無框架）
- 手機版優先（Mobile First）
- 單頁應用（SPA）
- 資料儲存：localStorage
- 條碼：JsBarcode（CDN，Code128 格式）

## 功能摘要

| 功能 | 說明 |
|------|------|
| URL 參數 | `?code=ABC123` 取得瓶蓋代碼 |
| 狀態一 | 首次掃描 → 填寫姓名＋手機 |
| 狀態二 | 已填資料 → 進入 Canvas 刮刮樂 |
| 狀態三 | 已刮過 → 顯示「已參加過」 |
| 刮刮樂 | Canvas 手指滑動，刮開 >50% 自動抽獎 |
| 條碼 | JsBarcode Code128 + 12 位隨機數字 |
| 動畫 | Loading spinner、confetti 撒花、彈跳動畫 |
| 震動 | 支援手機震動 API |

## 抽獎機率

| 獎項 | 獎品 | 機率 |
|------|------|------|
| 頭獎 | iPhone 17 | 34% |
| 二獎 | AirPods | 30% |
| 三獎 | 超商禮券 100 元 | 20% |
| 四獎 | 買一送一券 | 10% |
| 五獎 | 折價 50 元 | 5% |
| — | 銘謝惠顧 | 1% |

## 活動流程

1. 將網址生成 QR Code，印在飲料瓶蓋內側
2. 使用者打開瓶蓋，用手機掃描 QR Code
3. 進入活動網站
4. 第一次掃描 → 填寫姓名與電話
5. 填寫後 → 進入刮刮樂頁面
6. 刮開後 → 顯示隨機獎項與兌換條碼
7. 再次掃描同一個 code → 顯示「已參加過活動」

## 測試方式

直接用瀏覽器開啟，帶上 query 參數：

```
index.html?code=TEST001
```

## 獎品圖片

圖片放入 `images/` 目錄，命名規則：

- `prize_01.png` — iPhone 17
- `prize_02.png` — AirPods
- `prize_03.png` — 超商禮券 100 元
- `prize_04.png` — 買一送一券
- `prize_05.png` — 折價 50 元
- `prize_06.png` — 銘謝惠顧

建議使用 1:1 比例圖片。未放置圖片時會自動顯示 emoji 作為 placeholder。

## Demo 模式

`app.js` 中設有：

```js
const DEMO_MODE = true;
```

設為 `false` 可預留未來串接後端 API 的架構。
