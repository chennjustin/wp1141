"use strict";
// Footer 配置檔案 - 從home頁面獲取footer內容和樣式
// 只有home頁面有footer HTML，其他頁面通過JavaScript載入
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 從home頁面獲取footer HTML內容
function loadFooterFromHome() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 獲取home頁面的HTML
            const response = yield fetch('../home/index.html');
            const html = yield response.text();
            // 解析HTML並提取footer部分
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const homeFooter = doc.querySelector('.footer');
            if (homeFooter) {
                // 在當前頁面插入footer
                const footerContainer = document.querySelector('.footer') ||
                    document.querySelector('body');
                if (footerContainer && footerContainer.classList.contains('footer')) {
                    // 替換現有footer
                    footerContainer.outerHTML = homeFooter.outerHTML;
                }
                else {
                    // 在body末尾添加footer
                    document.body.insertAdjacentHTML('beforeend', homeFooter.outerHTML);
                }
                // 載入home頁面的CSS以確保樣式一致
                loadHomeStylesFromNavbar();
            }
        }
        catch (error) {
            console.error('無法載入footer:', error);
            // 如果無法載入，使用預設footer
            createDefaultFooter();
        }
    });
}
// 包裝函數以避免重複定義
function loadHomeStylesFromNavbar() {
    // 如果navbar-config.ts已載入，直接調用
    if (typeof loadHomeStyles === 'function') {
        loadHomeStyles();
    }
    else {
        // 備用方案：直接實現載入邏輯
        if (!document.querySelector('link[href*="home.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '../home/home.css';
            document.head.appendChild(link);
        }
    }
}
// 創建預設footer（備用方案）
function createDefaultFooter() {
    const defaultFooter = `
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 陳竑齊. 保留所有權利.</p>
        <div class="footer-social">
          <a href="mailto:chenjustin824@ntu.im"><i class="fas fa-envelope"></i></a>
          <a href="https://github.com/chennjustin" target="_blank"><i class="fab fa-github"></i></a>
          <a href="https://www.linkedin.com/in/hung-chi-chen-b82b86369/" target="_blank"><i class="fab fa-linkedin"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </footer>
  `;
    document.body.insertAdjacentHTML('beforeend', defaultFooter);
}
// 如果不在home頁面，則載入home的footer
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 檢查當前是否在home頁面
        const isHomePage = window.location.pathname.includes('/home/') ||
            window.location.pathname.includes('index.html');
        if (!isHomePage) {
            loadFooterFromHome();
        }
    });
}
