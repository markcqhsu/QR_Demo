/* ==============================================================
   QR Code 瓶蓋刮刮樂活動 Demo
   所有邏輯集中於此檔案
   ============================================================== */

// ==================== 設定 ====================

const DEMO_MODE = true;  // true = 純前端 localStorage；false = 預留未來串接後端

// 獎項設定：機率總和必須為 100
const PRIZES = [
    { id: 'prize_01', name: 'iPhone 17',        chance: 1,  image: 'images/prize_01.png' },
    { id: 'prize_02', name: 'AirPods',          chance: 5,  image: 'images/prize_02.png' },
    { id: 'prize_03', name: '超商禮券 100 元',   chance: 10, image: 'images/prize_03.png' },
    { id: 'prize_04', name: '買一送一券',        chance: 20, image: 'images/prize_04.png' },
    { id: 'prize_05', name: '折價 50 元',        chance: 30, image: 'images/prize_05.png' },
    { id: 'prize_06', name: '銘謝惠顧',          chance: 34, image: 'images/prize_06.png' },
];

// localStorage key prefix
const STORAGE_PREFIX = 'scratch_event_';

// ==================== DOM 元素 ====================

const pages = {
    loading:  document.getElementById('page-loading'),
    register: document.getElementById('page-register'),
    scratch:  document.getElementById('page-scratch'),
    prize:    document.getElementById('page-prize'),
    used:     document.getElementById('page-used'),
    error:    document.getElementById('page-error'),
};

// ==================== 工具函式 ====================

/** 切換頁面 */
function showPage(name) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    pages[name].classList.add('active');
}

/** 從 URL 取得 code 參數 */
function getCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

/** 讀取某 code 的資料 */
function getData(code) {
    const raw = localStorage.getItem(STORAGE_PREFIX + code);
    return raw ? JSON.parse(raw) : null;
}

/** 寫入某 code 的資料 */
function saveData(code, data) {
    localStorage.setItem(STORAGE_PREFIX + code, JSON.stringify(data));
}

/** 產生 12 位隨機數字條碼 */
function generateBarcodeNumber() {
    let num = '';
    for (let i = 0; i < 12; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

/** 依機率抽獎 */
function drawPrize() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const prize of PRIZES) {
        cumulative += prize.chance;
        if (rand < cumulative) {
            return prize;
        }
    }
    // fallback（理論上不會到這裡）
    return PRIZES[PRIZES.length - 1];
}

/** 手機震動（如支援） */
function vibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// ==================== 主流程 ====================

let currentCode = null;

function init() {
    currentCode = getCodeFromURL();

    // 無 code → 顯示錯誤頁
    if (!currentCode) {
        setTimeout(() => showPage('error'), 800);
        return;
    }

    // 模擬 loading 延遲
    setTimeout(() => {
        if (DEMO_MODE) {
            handleLocalFlow(currentCode);
        } else {
            // 未來串接後端時在此呼叫 API
            handleLocalFlow(currentCode);
        }
    }, 1200);
}

function handleLocalFlow(code) {
    const data = getData(code);

    if (!data) {
        // 狀態一：未掃描 → 填資料頁
        showPage('register');
    } else if (!data.scratched) {
        // 狀態二：已填資料但未刮 → 刮刮樂頁
        showPage('scratch');
        initScratchCard();
    } else {
        // 狀態三：已刮過 → 已參加頁
        showUsedPage(data);
    }
}

// ==================== 填資料頁 ====================

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();

    if (!name || !phone) return;

    // 驗證手機格式
    if (!/^09\d{8}$/.test(phone)) {
        alert('請輸入正確的手機號碼格式（09 開頭共 10 碼）');
        return;
    }

    // 儲存資料
    saveData(currentCode, {
        name: name,
        phone: phone,
        scratched: false,
        prize: null,
    });

    vibrate(50);
    showPage('scratch');
    initScratchCard();
});

// ==================== 刮刮樂 ====================

let scratchCanvas, scratchCtx;
let isScratching = false;
let scratchRevealed = false;

function initScratchCard() {
    scratchRevealed = false;
    scratchCanvas = document.getElementById('scratch-canvas');
    const container = document.querySelector('.scratch-container');

    // 等待容器渲染完成後再設定 canvas 尺寸
    requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        scratchCanvas.width = rect.width * dpr;
        scratchCanvas.height = rect.height * dpr;
        scratchCanvas.style.width = rect.width + 'px';
        scratchCanvas.style.height = rect.height + 'px';

        scratchCtx = scratchCanvas.getContext('2d');
        scratchCtx.scale(dpr, dpr);

        // 繪製灰色遮罩
        scratchCtx.fillStyle = '#b0b0b0';
        scratchCtx.fillRect(0, 0, rect.width, rect.height);

        // 遮罩上的提示文字
        scratchCtx.fillStyle = '#888';
        scratchCtx.font = 'bold 20px sans-serif';
        scratchCtx.textAlign = 'center';
        scratchCtx.textBaseline = 'middle';
        scratchCtx.fillText('用手指刮開此區域', rect.width / 2, rect.height / 2);

        // 設定刮除混合模式
        scratchCtx.globalCompositeOperation = 'destination-out';

        // 設定底層文字
        document.getElementById('scratch-prize-text').textContent = '🎁 刮開揭曉獎品 🎁';

        // 綁定事件
        scratchCanvas.addEventListener('mousedown', onScratchStart);
        scratchCanvas.addEventListener('mousemove', onScratchMove);
        scratchCanvas.addEventListener('mouseup', onScratchEnd);
        scratchCanvas.addEventListener('touchstart', onScratchStart, { passive: false });
        scratchCanvas.addEventListener('touchmove', onScratchMove, { passive: false });
        scratchCanvas.addEventListener('touchend', onScratchEnd);
    });
}

function getScratchPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
    };
}

function onScratchStart(e) {
    if (scratchRevealed) return;
    e.preventDefault();
    isScratching = true;
    const pos = getScratchPos(e);
    scratchCtx.beginPath();
    scratchCtx.moveTo(pos.x, pos.y);
}

function onScratchMove(e) {
    if (!isScratching || scratchRevealed) return;
    e.preventDefault();
    const pos = getScratchPos(e);

    scratchCtx.lineWidth = 40;
    scratchCtx.lineCap = 'round';
    scratchCtx.lineJoin = 'round';
    scratchCtx.lineTo(pos.x, pos.y);
    scratchCtx.stroke();

    // 檢查刮除比例
    checkScratchProgress();
}

function onScratchEnd() {
    isScratching = false;
}

function checkScratchProgress() {
    if (scratchRevealed) return;

    const dpr = window.devicePixelRatio || 1;
    const imageData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparent++;
    }

    const percent = transparent / total;

    if (percent > 0.5) {
        scratchRevealed = true;
        vibrate([100, 50, 100]);
        onScratchComplete();
    }
}

function onScratchComplete() {
    // 抽獎
    const prize = drawPrize();
    const barcodeNum = generateBarcodeNumber();

    // 更新 localStorage
    const data = getData(currentCode);
    data.scratched = true;
    data.prize = {
        id: prize.id,
        name: prize.name,
        image: prize.image,
        barcodeNumber: barcodeNum,
    };
    saveData(currentCode, data);

    // 延遲後跳轉獎品頁
    setTimeout(() => {
        showPrizePage(data.prize);
    }, 600);
}

// ==================== 中獎頁 ====================

function showPrizePage(prize) {
    const isNoPrize = prize.id === 'prize_06';

    // 標題
    const titleEl = document.getElementById('prize-title');
    titleEl.textContent = isNoPrize ? '😅 銘謝惠顧' : '🎊 恭喜中獎！';

    // 圖片
    const imgEl = document.getElementById('prize-image');
    imgEl.src = prize.image;
    imgEl.alt = prize.name;
    // placeholder fallback
    imgEl.onerror = function () {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<div style="font-size:64px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' +
            (isNoPrize ? '🙏' : '🎁') + '</div>';
    };

    // 獎品名稱
    document.getElementById('prize-name').textContent = prize.name;

    // 條碼
    try {
        JsBarcode('#prize-barcode', prize.barcodeNumber, {
            format: 'CODE128',
            width: 2,
            height: 60,
            displayValue: false,
            margin: 0,
        });
    } catch (err) {
        console.warn('JsBarcode 載入失敗', err);
    }
    document.getElementById('barcode-number').textContent = prize.barcodeNumber;

    // 銘謝惠顧特殊樣式
    if (isNoPrize) {
        pages.prize.classList.add('no-prize');
    } else {
        pages.prize.classList.remove('no-prize');
    }

    showPage('prize');

    // 中獎動畫（非銘謝惠顧）
    if (!isNoPrize) {
        launchConfetti();
        vibrate([200, 100, 200, 100, 300]);
    }
}

// ==================== 已參加過頁 ====================

function showUsedPage(data) {
    const infoEl = document.getElementById('used-info');
    let html = '';
    if (data.prize) {
        html += '<p><strong>參加者：</strong>' + escapeHTML(data.name) + '</p>';
        html += '<p><strong>中獎獎品：</strong>' + escapeHTML(data.prize.name) + '</p>';
        html += '<p><strong>條碼號碼：</strong>' + escapeHTML(data.prize.barcodeNumber) + '</p>';
    }
    infoEl.innerHTML = html;
    showPage('used');
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== Confetti 動畫 ====================

function launchConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';

    const colors = ['#ff6b35', '#ffd700', '#ff4081', '#4caf50', '#2196f3', '#9c27b0'];
    const pieceCount = 60;

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = (Math.random() * 1.5) + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(piece);
    }

    // 清除動畫元素
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// ==================== 啟動 ====================

document.addEventListener('DOMContentLoaded', init);
