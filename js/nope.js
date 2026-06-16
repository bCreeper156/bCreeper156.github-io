/**
 * nope.js - 全站统一弹窗组件（主站自动屏蔽版 + 关闭后重置 + 主站文字纯文本）
 * 功能：仅在非主站页面每次访问时弹窗，引导前往主站并同步当前路径。
 * 版本：2.3.0
 */

(function() {
    // ======================== 配置 ========================
    const STORAGE_KEY = 'creeper156_popup_main_site_shown';
    const MAIN_SITE_DOMAIN = '156blog.pages.dev';
    const MAIN_SITE_PROTOCOL = 'https://';
    const POPUP_DELAY = 200;
    // =====================================================

    // 获取主站目标 URL（保留路径、查询、hash）
    function getTargetMainUrl() {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentHash = window.location.hash;
        return `${MAIN_SITE_PROTOCOL}${MAIN_SITE_DOMAIN}${currentPath}${currentSearch}${currentHash}`;
    }

    // 判断是否已在主站
    function isAlreadyOnMainSite() {
        const currentHost = window.location.hostname;
        return currentHost === MAIN_SITE_DOMAIN || currentHost === `www.${MAIN_SITE_DOMAIN}`;
    }

    // 弹窗 HTML（主站文字为纯文本，无超链接）
    const createPopupHTML = () => {
        const targetUrl = getTargetMainUrl();
        return `
        <div id="nope-popup-overlay" class="nope-overlay">
            <div class="nope-popup-container">
                <button class="nope-close-btn" aria-label="关闭">&times;</button>
                <div class="nope-popup-icon">✨</div>
                <h3 class="nope-popup-title">发现更多精彩</h3>
                <p class="nope-popup-message">
                    前往 主站 体验更多功能<br>
                    <span style="font-size:0.8rem; opacity:0.7;">将自动跳转到当前页面</span>
                </p>
                <div class="nope-popup-actions">
                    <button class="nope-btn nope-btn-primary" id="nope-go-main">前往主站 →</button>
                    <button class="nope-btn nope-btn-secondary" id="nope-close-popup">暂不，关闭</button>
                </div>
                <p class="nope-popup-footnote">关闭后将重置，下次访问仍会提示</p>
            </div>
        </div>
    `;};

    // 注入样式（不变）
    const injectStyles = () => {
        const styleId = 'nope-popup-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .nope-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(3px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                animation: nope-fade-in 0.2s ease-out;
            }
            .nope-popup-container {
                background: #ffffff;
                max-width: 400px;
                width: 90%;
                margin: 20px;
                border-radius: 28px;
                box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.25);
                padding: 24px 20px 28px;
                text-align: center;
                position: relative;
                animation: nope-slide-up 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            }
            .nope-close-btn {
                position: absolute;
                top: 16px;
                right: 20px;
                background: none;
                border: none;
                font-size: 28px;
                line-height: 1;
                cursor: pointer;
                color: #9ca3af;
                padding: 4px 8px;
                border-radius: 40px;
                transition: background 0.2s, color 0.2s;
            }
            .nope-close-btn:hover {
                background-color: #f3f4f6;
                color: #374151;
            }
            .nope-popup-icon {
                font-size: 48px;
                margin-bottom: 8px;
            }
            .nope-popup-title {
                font-size: 1.7rem;
                font-weight: 700;
                margin: 8px 0 8px;
                color: #1f2937;
                letter-spacing: -0.3px;
            }
            .nope-popup-message {
                font-size: 1rem;
                color: #4b5563;
                margin: 16px 0 12px;
                line-height: 1.5;
            }
            .nope-link {
                color: #2c7be5;
                text-decoration: none;
                font-weight: 600;
                border-bottom: 1px dashed #9ac8ff;
                transition: color 0.2s, border-color 0.2s;
            }
            .nope-link:hover {
                color: #1a56db;
                border-bottom-color: #1a56db;
            }
            .nope-popup-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            .nope-btn {
                border: none;
                padding: 10px 20px;
                border-radius: 60px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                background-color: #f3f4f6;
                color: #374151;
            }
            .nope-btn-primary {
                background: linear-gradient(135deg, #2563eb, #1e40af);
                color: white;
                box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
            }
            .nope-btn-primary:hover {
                background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
                transform: translateY(-1px);
                box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
            }
            .nope-btn-secondary {
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
            }
            .nope-btn-secondary:hover {
                background-color: #e5e7eb;
            }
            .nope-popup-footnote {
                font-size: 0.7rem;
                color: #9ca3af;
                margin-top: 20px;
                margin-bottom: 0;
            }
            @keyframes nope-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes nope-slide-up {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.96);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            @media (max-width: 480px) {
                .nope-popup-container { padding: 20px 16px 24px; }
                .nope-popup-title { font-size: 1.5rem; }
                .nope-btn { padding: 8px 18px; }
            }
        `;
        document.head.appendChild(style);
    };

    // 移除弹窗
    const removePopup = () => {
        const overlay = document.getElementById('nope-popup-overlay');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    // 关闭弹窗并重置存储（删除键，下次仍会弹窗）
    const closeAndReset = () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
        removePopup();
    };

    // 前往主站（新标签页，同步路径）并重置存储
    const goToMainSite = () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
        const targetUrl = getTargetMainUrl();
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        removePopup();
    };

    // 绑定事件
    const bindEvents = () => {
        const closeBtn = document.getElementById('nope-close-popup');
        const closeX = document.querySelector('.nope-close-btn');
        const goBtn = document.getElementById('nope-go-main');
        const overlay = document.getElementById('nope-popup-overlay');
        if (closeBtn) closeBtn.addEventListener('click', closeAndReset);
        if (closeX) closeX.addEventListener('click', closeAndReset);
        if (goBtn) goBtn.addEventListener('click', goToMainSite);
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAndReset();
        });
    };

    // 展示弹窗
    const showPopup = () => {
        if (document.getElementById('nope-popup-overlay')) return;
        injectStyles();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = createPopupHTML();
        const popupEl = wrapper.firstElementChild;
        document.body.appendChild(popupEl);
        bindEvents();
    };

    // 判断是否应该显示（主站不显示，非主站总是显示）
    const shouldShowPopup = () => {
        if (isAlreadyOnMainSite()) return false;
        return true;
    };

    // 初始化
    const initPopup = () => {
        if (!shouldShowPopup()) return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(showPopup, POPUP_DELAY));
        } else {
            setTimeout(showPopup, POPUP_DELAY);
        }
    };

    initPopup();
})();
