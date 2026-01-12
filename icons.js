// 斗兽棋 Twemoji 图标库
// 使用 Twitter 开源的高质量 emoji

// Twemoji CDN 基础URL
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/';

// 动物 emoji 的 Unicode 码点
const ANIMAL_CODES = {
    ELEPHANT: '1f418',  // 🐘
    LION: '1f981',      // 🦁
    TIGER: '1f42f',     // 🐯
    LEOPARD: '1f406',   // 🐆
    WOLF: '1f43a',      // 🐺
    DOG: '1f415',       // 🐕
    CAT: '1f431',       // 🐱
    RAT: '1f42d'        // 🐭
};

// 生成 Twemoji 图片标签
function getTwemojiImg(type, size = 32) {
    const code = ANIMAL_CODES[type];
    if (!code) return '';
    return `<img src="${TWEMOJI_BASE}${code}.svg" alt="${type}" class="twemoji" style="width:${size}px;height:${size}px;">`;
}

// 动物图标对象（兼容旧代码）
const ANIMAL_ICONS = {
    ELEPHANT: getTwemojiImg('ELEPHANT'),
    LION: getTwemojiImg('LION'),
    TIGER: getTwemojiImg('TIGER'),
    LEOPARD: getTwemojiImg('LEOPARD'),
    WOLF: getTwemojiImg('WOLF'),
    DOG: getTwemojiImg('DOG'),
    CAT: getTwemojiImg('CAT'),
    RAT: getTwemojiImg('RAT')
};

// 特殊格子图标 - 使用更精美的SVG设计
const SPECIAL_ICONS = {
    // 陷阱 - 捕兽网
    TRAP: `
        <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <!-- 网的背景 -->
            <circle cx="18" cy="18" r="15" fill="#F5DEB3" opacity="0.3"/>
            <!-- 网格线 - 横向 -->
            <path d="M3 10 Q18 8 33 10" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <path d="M3 18 Q18 15 33 18" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <path d="M3 26 Q18 23 33 26" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <!-- 网格线 - 纵向 -->
            <path d="M10 3 Q8 18 10 33" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <path d="M18 3 Q15 18 18 33" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <path d="M26 3 Q23 18 26 33" stroke="#8B4513" stroke-width="1.5" fill="none"/>
            <!-- 网格线 - 斜向 -->
            <line x1="5" y1="5" x2="31" y2="31" stroke="#A0522D" stroke-width="1" opacity="0.6"/>
            <line x1="31" y1="5" x2="5" y2="31" stroke="#A0522D" stroke-width="1" opacity="0.6"/>
            <!-- 网的边缘绳子 -->
            <circle cx="18" cy="18" r="14" stroke="#8B4513" stroke-width="2" fill="none"/>
            <!-- 绳结装饰 -->
            <circle cx="18" cy="4" r="2" fill="#A0522D"/>
            <circle cx="18" cy="32" r="2" fill="#A0522D"/>
            <circle cx="4" cy="18" r="2" fill="#A0522D"/>
            <circle cx="32" cy="18" r="2" fill="#A0522D"/>
        </svg>
    `,

    // 红方兽穴 - 红色小城堡
    DEN_RED: `
        <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <!-- 城堡主体 -->
            <rect x="6" y="16" width="24" height="18" fill="#C41E3A" rx="2"/>
            <!-- 城堡顶部城垛 -->
            <rect x="4" y="12" width="6" height="8" fill="#DC143C" rx="1"/>
            <rect x="15" y="12" width="6" height="8" fill="#DC143C" rx="1"/>
            <rect x="26" y="12" width="6" height="8" fill="#DC143C" rx="1"/>
            <!-- 城垛顶部 -->
            <rect x="5" y="10" width="4" height="4" fill="#B22222" rx="1"/>
            <rect x="16" y="8" width="4" height="6" fill="#B22222" rx="1"/>
            <rect x="27" y="10" width="4" height="4" fill="#B22222" rx="1"/>
            <!-- 中间塔楼旗帜 -->
            <rect x="17" y="2" width="2" height="8" fill="#8B0000"/>
            <polygon points="19,2 28,5 19,8" fill="#FF4444"/>
            <!-- 城门 -->
            <rect x="13" y="24" width="10" height="10" fill="#8B0000" rx="5 5 0 0"/>
            <rect x="15" y="26" width="6" height="8" fill="#2F1810" rx="3 3 0 0"/>
            <!-- 窗户 -->
            <rect x="8" y="18" width="4" height="4" fill="#FFD700" rx="1"/>
            <rect x="24" y="18" width="4" height="4" fill="#FFD700" rx="1"/>
            <!-- 城堡装饰线 -->
            <line x1="6" y1="22" x2="30" y2="22" stroke="#A01030" stroke-width="1"/>
        </svg>
    `,

    // 蓝方兽穴 - 蓝色小城堡
    DEN_BLUE: `
        <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <!-- 城堡主体 -->
            <rect x="6" y="16" width="24" height="18" fill="#1E90FF" rx="2"/>
            <!-- 城堡顶部城垛 -->
            <rect x="4" y="12" width="6" height="8" fill="#4169E1" rx="1"/>
            <rect x="15" y="12" width="6" height="8" fill="#4169E1" rx="1"/>
            <rect x="26" y="12" width="6" height="8" fill="#4169E1" rx="1"/>
            <!-- 城垛顶部 -->
            <rect x="5" y="10" width="4" height="4" fill="#0000CD" rx="1"/>
            <rect x="16" y="8" width="4" height="6" fill="#0000CD" rx="1"/>
            <rect x="27" y="10" width="4" height="4" fill="#0000CD" rx="1"/>
            <!-- 中间塔楼旗帜 -->
            <rect x="17" y="2" width="2" height="8" fill="#00008B"/>
            <polygon points="19,2 28,5 19,8" fill="#4488FF"/>
            <!-- 城门 -->
            <rect x="13" y="24" width="10" height="10" fill="#00008B" rx="5 5 0 0"/>
            <rect x="15" y="26" width="6" height="8" fill="#1A1A2E" rx="3 3 0 0"/>
            <!-- 窗户 -->
            <rect x="8" y="18" width="4" height="4" fill="#FFD700" rx="1"/>
            <rect x="24" y="18" width="4" height="4" fill="#FFD700" rx="1"/>
            <!-- 城堡装饰线 -->
            <line x1="6" y1="22" x2="30" y2="22" stroke="#1070D0" stroke-width="1"/>
        </svg>
    `,

    // 河流 - 动态波浪效果
    RIVER: `
        <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#5BA3D9"/>
                    <stop offset="50%" style="stop-color:#3D8BC9"/>
                    <stop offset="100%" style="stop-color:#2D7AB9"/>
                </linearGradient>
            </defs>
            <rect width="36" height="36" fill="url(#riverGrad)"/>
            <!-- 波浪 -->
            <path d="M-5 10 Q4 6 13 10 T31 10 T49 10" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none">
                <animate attributeName="d" dur="2s" repeatCount="indefinite"
                    values="M-5 10 Q4 6 13 10 T31 10 T49 10;M-5 10 Q4 14 13 10 T31 10 T49 10;M-5 10 Q4 6 13 10 T31 10 T49 10"/>
            </path>
            <path d="M-5 18 Q4 14 13 18 T31 18 T49 18" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none">
                <animate attributeName="d" dur="2.5s" repeatCount="indefinite"
                    values="M-5 18 Q4 14 13 18 T31 18 T49 18;M-5 18 Q4 22 13 18 T31 18 T49 18;M-5 18 Q4 14 13 18 T31 18 T49 18"/>
            </path>
            <path d="M-5 26 Q4 22 13 26 T31 26 T49 26" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none">
                <animate attributeName="d" dur="3s" repeatCount="indefinite"
                    values="M-5 26 Q4 22 13 26 T31 26 T49 26;M-5 26 Q4 30 13 26 T31 26 T49 26;M-5 26 Q4 22 13 26 T31 26 T49 26"/>
            </path>
            <!-- 水面反光 -->
            <ellipse cx="10" cy="15" rx="3" ry="1" fill="rgba(255,255,255,0.3)"/>
            <ellipse cx="26" cy="22" rx="4" ry="1" fill="rgba(255,255,255,0.2)"/>
        </svg>
    `
};

// 获取动物图标
function getAnimalIcon(type, player) {
    return ANIMAL_ICONS[type] || '';
}

// 获取特殊格子图标
function getSpecialIcon(type) {
    return SPECIAL_ICONS[type] || '';
}
