"use strict";
// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）
// 照片載入處理
class ProfileImageHandler {
    constructor() {
        this.profilePhoto = document.querySelector('.profile-photo');
        this.imagePlaceholder = document.querySelector('.profile-image .image-placeholder');
        this.init();
    }
    init() {
        if (this.profilePhoto) {
            this.profilePhoto.addEventListener('error', () => {
                this.handleImageError();
            });
            this.profilePhoto.addEventListener('load', () => {
                this.handleImageLoad();
            });
        }
    }
    handleImageError() {
        // 照片載入失敗時，隱藏照片並顯示備用圖示
        if (this.profilePhoto) {
            this.profilePhoto.style.display = 'none';
        }
        if (this.imagePlaceholder) {
            this.imagePlaceholder.style.display = 'flex';
        }
    }
    handleImageLoad() {
        // 照片載入成功時，確保照片顯示，備用圖示隱藏
        if (this.profilePhoto) {
            this.profilePhoto.style.display = 'block';
        }
        if (this.imagePlaceholder) {
            this.imagePlaceholder.style.display = 'none';
        }
    }
}
// Title動畫功能
class TitleAnimation {
    constructor() {
        this.titles = [
            '臺灣大學資訊管理學系',
            'SITCON2025行銷組',
            '努力賺錢中'
        ];
        this.currentIndex = 0;
        this.titleElement = document.querySelector('.animated-title');
        this.dots = document.querySelectorAll('.dot');
        if (this.titleElement) {
            this.init();
        }
    }
    init() {
        // 開始動畫循環
        this.startAnimation();
    }
    startAnimation() {
        // 每3秒切換一次title
        setInterval(() => {
            this.switchTitle();
        }, 3000);
    }
    switchTitle() {
        var _a;
        // 淡出當前title
        (_a = this.titleElement) === null || _a === void 0 ? void 0 : _a.classList.add('fade-out');
        setTimeout(() => {
            var _a, _b;
            // 更新title內容
            this.currentIndex = (this.currentIndex + 1) % this.titles.length;
            if (this.titleElement) {
                this.titleElement.textContent = this.titles[this.currentIndex];
            }
            // 更新點點狀態
            this.updateDots();
            // 淡入新title
            (_a = this.titleElement) === null || _a === void 0 ? void 0 : _a.classList.remove('fade-out');
            (_b = this.titleElement) === null || _b === void 0 ? void 0 : _b.classList.add('fade-in');
            // 移除fade-in類，準備下次動畫
            setTimeout(() => {
                var _a;
                (_a = this.titleElement) === null || _a === void 0 ? void 0 : _a.classList.remove('fade-in');
            }, 500);
        }, 250);
    }
    updateDots() {
        // 移除所有active類
        this.dots.forEach((dot) => {
            dot.classList.remove('active');
        });
        // 為當前對應的點點添加active類
        if (this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.add('active');
        }
    }
}
// 主題切換功能
class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }
    init() {
        if (this.themeToggle) {
            // 載入保存的主題設置
            this.loadTheme();
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    toggleTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            // 切換到淺色模式
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            this.updateThemeIcon('moon');
        }
        else {
            // 切換到深色模式
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            this.updateThemeIcon('sun');
        }
    }
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            this.updateThemeIcon('sun');
        }
        else {
            document.body.classList.remove('dark-mode');
            this.updateThemeIcon('moon');
        }
    }
    updateThemeIcon(iconType) {
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = `fas fa-${iconType}`;
            }
        }
    }
}
// 語言切換功能已移除，翻譯文案現在直接寫在 HTML 中
// 頁面載入完成後初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new ProfileImageHandler();
    new TitleAnimation();
    new ThemeToggle();
    // 添加頁面載入動畫
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
