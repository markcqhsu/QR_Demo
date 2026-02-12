/* ==============================================================
   QR Code 瓶蓋刮刮樂活動 Demo
   所有邏輯集中於此檔案
   ============================================================== */

// ==================== 設定 ====================

const DEMO_MODE = true;  // true = 純前端 localStorage；false = 預留未來串接後端

// 獎項設定：機率總和必須為 100
const PRIZES = [
    { id: 'prize_01', name: { zh: 'iPhone 17',        en: 'iPhone 17',        th: 'iPhone 17' },        chance: 34, image: 'images/prize_01.png' },
    { id: 'prize_02', name: { zh: 'AirPods',          en: 'AirPods',          th: 'AirPods' },          chance: 30, image: 'images/prize_02.png' },
    { id: 'prize_03', name: { zh: '超商禮券 100 元',   en: '$100 Gift Card',   th: 'บัตรของขวัญ 100 บาท' },   chance: 20, image: 'images/prize_03.png' },
    { id: 'prize_04', name: { zh: '買一送一券',        en: 'Buy 1 Get 1 Free', th: 'ซื้อ 1 แถม 1' }, chance: 10, image: 'images/prize_04.png' },
    { id: 'prize_05', name: { zh: '折價 50 元',        en: '$50 Discount',     th: 'ส่วนลด 50 บาท' },     chance: 5,  image: 'images/prize_05.png' },
    { id: 'prize_06', name: { zh: '銘謝惠顧',          en: 'Better Luck Next Time', th: 'ขอบคุณที่ร่วมกิจกรรม' }, chance: 1, image: 'images/prize_06.png' },
];

// localStorage key prefix
const STORAGE_PREFIX = 'scratch_event_';

// ==================== 多國語言字典 ====================

const LANG = {
    zh: {
        // 頁面 title
        page_title: '瓶蓋刮刮樂活動',
        // Loading 頁
        loading_text: '驗證活動資格中...',
        // 填資料頁
        register_title: '瓶蓋刮刮樂',
        register_subtitle: '填寫資料即可參加抽獎！',
        label_name: '姓名',
        label_phone: '手機號碼',
        placeholder_name: '請輸入您的姓名',
        placeholder_phone: '例：0912345678',
        btn_start: '開始刮獎！',
        // 刮刮樂頁
        scratch_title: '刮刮樂',
        scratch_subtitle: '用手指刮開灰色區域',
        scratch_hint: '刮開超過 50% 即可揭曉獎品',
        scratch_canvas_text: '用手指刮開此區域',
        scratch_hidden_text: '🎁 刮開揭曉獎品 🎁',
        // 中獎頁
        prize_title_win: '🎊 恭喜中獎！',
        prize_title_lose: '😅 銘謝惠顧',
        redeem_title: '兌換說明',
        redeem_1: '請於活動期間內至指定門市出示此畫面兌換',
        redeem_2: '每組條碼僅限兌換一次',
        redeem_3: '獎品不得轉讓或折換現金',
        redeem_4: '活動期限：即日起至 2026/12/31',
        screenshot_hint: '📸 建議截圖保存此畫面',
        // 已參加過頁
        used_title: '此瓶蓋已參加過活動',
        used_desc: '每個瓶蓋僅能參加一次抽獎活動，<br>感謝您的參與！',
        used_participant: '參加者：',
        used_prize: '中獎獎品：',
        used_barcode: '條碼號碼：',
        // 錯誤頁
        error_title: '無效的活動連結',
        error_desc: '請確認您掃描的是正確的瓶蓋 QR Code。',
        // 重置按鈕
        btn_reset: '🗑 清除此瓶蓋紀錄',
        confirm_reset: '確定要清除此瓶蓋紀錄嗎？清除後可重新參加活動。',
        // 表單驗證
        alert_phone: '請輸入正確的手機號碼格式（09 開頭共 10 碼）',
    },
    en: {
        page_title: 'Bottle Cap Scratch Card',
        loading_text: 'Verifying eligibility...',
        register_title: 'Scratch & Win',
        register_subtitle: 'Fill in your info to join the lucky draw!',
        label_name: 'Name',
        label_phone: 'Phone Number',
        placeholder_name: 'Enter your name',
        placeholder_phone: 'e.g. 0912345678',
        btn_start: 'Start Scratching!',
        scratch_title: 'Scratch Card',
        scratch_subtitle: 'Use your finger to scratch the grey area',
        scratch_hint: 'Scratch over 50% to reveal your prize',
        scratch_canvas_text: 'Scratch here',
        scratch_hidden_text: '🎁 Scratch to Reveal 🎁',
        prize_title_win: '🎊 Congratulations!',
        prize_title_lose: '😅 Better Luck Next Time',
        redeem_title: 'Redemption Info',
        redeem_1: 'Present this screen at a designated store to redeem',
        redeem_2: 'Each barcode can only be redeemed once',
        redeem_3: 'Prizes are non-transferable and non-refundable',
        redeem_4: 'Valid from now until 2026/12/31',
        screenshot_hint: '📸 We recommend taking a screenshot',
        used_title: 'Already Participated',
        used_desc: 'Each bottle cap can only be used once.<br>Thank you for participating!',
        used_participant: 'Participant: ',
        used_prize: 'Prize Won: ',
        used_barcode: 'Barcode: ',
        error_title: 'Invalid Link',
        error_desc: 'Please make sure you scanned the correct bottle cap QR Code.',
        btn_reset: '🗑 Clear Record',
        confirm_reset: 'Are you sure you want to clear this record? You can participate again after clearing.',
        alert_phone: 'Please enter a valid phone number (10 digits starting with 09)',
    },
    th: {
        page_title: 'กิจกรรมขูดฝาขวด',
        loading_text: 'กำลังตรวจสอบสิทธิ์...',
        register_title: 'ขูดลุ้นรางวัล',
        register_subtitle: 'กรอกข้อมูลเพื่อร่วมลุ้นรางวัล!',
        label_name: 'ชื่อ',
        label_phone: 'เบอร์โทรศัพท์',
        placeholder_name: 'กรอกชื่อของคุณ',
        placeholder_phone: 'เช่น 0912345678',
        btn_start: 'เริ่มขูด!',
        scratch_title: 'บัตรขูด',
        scratch_subtitle: 'ใช้นิ้วขูดบริเวณสีเทา',
        scratch_hint: 'ขูดมากกว่า 50% เพื่อเปิดรางวัล',
        scratch_canvas_text: 'ขูดตรงนี้',
        scratch_hidden_text: '🎁 ขูดเพื่อเปิดรางวัล 🎁',
        prize_title_win: '🎊 ยินดีด้วย!',
        prize_title_lose: '😅 ขอบคุณที่ร่วมกิจกรรม',
        redeem_title: 'วิธีการแลกรางวัล',
        redeem_1: 'แสดงหน้าจอนี้ที่ร้านค้าที่กำหนดเพื่อแลกรางวัล',
        redeem_2: 'บาร์โค้ดแต่ละชุดใช้แลกได้เพียงครั้งเดียว',
        redeem_3: 'รางวัลไม่สามารถโอนสิทธิ์หรือแลกเป็นเงินสดได้',
        redeem_4: 'ใช้ได้ตั้งแต่วันนี้ถึง 2026/12/31',
        screenshot_hint: '📸 แนะนำให้บันทึกภาพหน้าจอไว้',
        used_title: 'เคยร่วมกิจกรรมแล้ว',
        used_desc: 'ฝาขวดแต่ละใบใช้ได้เพียงครั้งเดียว<br>ขอบคุณที่ร่วมกิจกรรม!',
        used_participant: 'ผู้เข้าร่วม: ',
        used_prize: 'รางวัลที่ได้: ',
        used_barcode: 'บาร์โค้ด: ',
        error_title: 'ลิงก์ไม่ถูกต้อง',
        error_desc: 'กรุณาตรวจสอบว่าคุณสแกน QR Code บนฝาขวดถูกต้อง',
        btn_reset: '🗑 ล้างข้อมูล',
        confirm_reset: 'คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลนี้? คุณสามารถเข้าร่วมกิจกรรมได้อีกครั้ง',
        alert_phone: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก ขึ้นต้นด้วย 09)',
    },
};

let currentLang = localStorage.getItem('scratch_lang') || 'zh';

/** 取得翻譯文字 */
function t(key) {
    return LANG[currentLang][key] || LANG['zh'][key] || key;
}

/** 取得獎品名稱（依語言） */
function getPrizeName(prize) {
    if (typeof prize.name === 'object') {
        return prize.name[currentLang] || prize.name.zh;
    }
    return prize.name;
}

/** 切換語言 */
function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('scratch_lang', lang);

    // 更新 html lang 屬性
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

    // 更新頁面 title
    document.title = t('page_title');

    // 更新按鈕 active 狀態
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 遍歷所有 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        // 保留含 <br> 的 HTML
        if (text.includes('<br>')) {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });

    // 遍歷所有 data-i18n-placeholder 元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

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
    // 初始化語言
    setLang(currentLang);

    // 綁定語言切換按鈕
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLang(btn.dataset.lang);
        });
    });

    // 綁定清除紀錄按鈕
    document.querySelectorAll('#btn-reset, #btn-reset-used').forEach(btn => {
        btn.addEventListener('click', resetCurrentCode);
    });

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

// ==================== 清除紀錄 ====================

function resetCurrentCode() {
    if (!currentCode) return;
    if (!confirm(t('confirm_reset'))) return;
    localStorage.removeItem(STORAGE_PREFIX + currentCode);
    showPage('register');
    // 清空表單
    document.getElementById('register-form').reset();
}

// ==================== 填資料頁 ====================

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();

    if (!name || !phone) return;

    // 驗證手機格式
    if (!/^09\d{8}$/.test(phone)) {
        alert(t('alert_phone'));
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

        // 遮罩上的提示文字（多國語言）
        scratchCtx.fillStyle = '#888';
        scratchCtx.font = 'bold 20px sans-serif';
        scratchCtx.textAlign = 'center';
        scratchCtx.textBaseline = 'middle';
        scratchCtx.fillText(t('scratch_canvas_text'), rect.width / 2, rect.height / 2);

        // 設定刮除混合模式
        scratchCtx.globalCompositeOperation = 'destination-out';

        // 設定底層文字（多國語言）
        document.getElementById('scratch-prize-text').textContent = t('scratch_hidden_text');

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

    // 更新 localStorage（儲存獎品名稱用中文，顯示時依語言切換）
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

    // 標題（多國語言）
    const titleEl = document.getElementById('prize-title');
    titleEl.textContent = isNoPrize ? t('prize_title_lose') : t('prize_title_win');

    // 圖片
    const imgEl = document.getElementById('prize-image');
    imgEl.src = prize.image;
    imgEl.alt = getStoredPrizeName(prize);
    // placeholder fallback
    imgEl.onerror = function () {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<div style="font-size:64px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' +
            (isNoPrize ? '🙏' : '🎁') + '</div>';
    };

    // 獎品名稱（多國語言）
    document.getElementById('prize-name').textContent = getStoredPrizeName(prize);

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

/** 從儲存的獎品資料取得當前語言的名稱 */
function getStoredPrizeName(prize) {
    if (typeof prize.name === 'object') {
        return prize.name[currentLang] || prize.name.zh;
    }
    // 舊資料相容：從 PRIZES 找對應翻譯
    const match = PRIZES.find(p => p.id === prize.id);
    if (match) {
        return match.name[currentLang] || match.name.zh;
    }
    return prize.name;
}

// ==================== 已參加過頁 ====================

function showUsedPage(data) {
    const infoEl = document.getElementById('used-info');
    let html = '';
    if (data.prize) {
        html += '<p><strong>' + t('used_participant') + '</strong>' + escapeHTML(data.name) + '</p>';
        html += '<p><strong>' + t('used_prize') + '</strong>' + escapeHTML(getStoredPrizeName(data.prize)) + '</p>';
        html += '<p><strong>' + t('used_barcode') + '</strong>' + escapeHTML(data.prize.barcodeNumber) + '</p>';
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
