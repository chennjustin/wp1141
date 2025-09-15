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
// 語言切換功能
class LanguageToggle {
    constructor() {
        this.languageToggle = document.getElementById('languageToggle');
        this.currentLanguage = 'zh';
        this.translations = {
            zh: {
                // 導航
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.travel': 'Travel',
                'nav.contact': 'Contact',
                // 個人資料
                'profile.name': '陳竑齊',
                'profile.title': '臺灣大學資訊管理學系',
                // 標籤
                'tags.investment': '投資小白',
                'tags.webdev': '網頁開發',
                'tags.data': '資料分析',
                'tags.magic': '魔術',
                'tags.volleyball': '排球',
                'tags.photography': '攝影',
                'tags.boardgames': '桌遊',
                // 介紹
                'intro.greeting': 'Hello!',
                'intro.subtitle': 'Here\'s Justin',
                'intro.paragraph1': '大家好，我是陳竑齊，目前就讀於臺大資管系大三。最近我正在練習不要被內卷影響，保持自己的節奏做事；我對於資訊技術、網頁開發、資料分析、量化交易、心理學有興趣。目前正在擔任經濟系教授的研究助理，參與相關研究專案',
                'intro.paragraph2': '在生活中，我喜歡拍天空，也熱衷於收集各式各樣的吊飾，也會不定時約朋友打排球，享受運動帶來的樂趣。',
                'intro.paragraph3': '我相信持續學習與成長的重要性，也深信透過分享知識和經驗，能讓我們彼此拓展視野。期待有機會能與大家交流想法、展開合作！',
                // 頁腳
                'footer.copyright': '© 2025.09 陳竑齊. 保留所有權利.'
            },
            en: {
                // 導航
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.travel': 'Travel',
                'nav.contact': 'Contact',
                // 個人資料
                'profile.name': 'Hung-Chi Chen',
                'profile.title': 'National Taiwan University, Information Management',
                // 標籤
                'tags.investment': 'Investment Beginner',
                'tags.webdev': 'Web Development',
                'tags.data': 'Data Analysis',
                'tags.magic': 'Magic',
                'tags.volleyball': 'Volleyball',
                'tags.photography': 'Photography',
                'tags.boardgames': 'Board Games',
                // 介紹
                'intro.greeting': 'Hello!',
                'intro.subtitle': 'Here\'s Justin',
                'intro.paragraph1': 'Hello everyone, I\'m Hung-Chi Chen, currently a junior at NTU\'s Information Management Department. Recently, I\'ve been practicing not to be affected by the competitive environment and maintaining my own pace. I\'m interested in information technology, web development, data analysis, quantitative trading, and psychology. Currently, I\'m working as a research assistant for an economics professor, participating in related research projects.',
                'intro.paragraph2': 'In daily life, I enjoy photographing the sky and collecting various keychains. I also regularly invite friends to play volleyball, enjoying the fun that sports bring.',
                'intro.paragraph3': 'I believe in the importance of continuous learning and growth, and I\'m convinced that through sharing knowledge and experiences, we can expand each other\'s horizons. I look forward to the opportunity to exchange ideas and collaborate with everyone!',
                // 頁腳
                'footer.copyright': '© 2025.09 Hung-Chi Chen. All rights reserved.'
            }
        };
        this.init();
    }
    init() {
        if (this.languageToggle) {
            // 載入保存的語言設置
            this.loadLanguage();
            this.languageToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        localStorage.setItem('language', this.currentLanguage);
        this.updateLanguage();
        this.updateLanguageButton();
    }
    loadLanguage() {
        const savedLanguage = localStorage.getItem('language');
        this.currentLanguage = savedLanguage || 'zh';
        this.updateLanguage();
        this.updateLanguageButton();
    }
    updateLanguage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-translate');
            if (key && this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
    }
    updateLanguageButton() {
        if (this.languageToggle) {
            const span = this.languageToggle.querySelector('span');
            if (span) {
                span.textContent = this.currentLanguage === 'zh' ? '中' : 'EN';
            }
        }
    }
}
// 頁面載入完成後初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new ProfileImageHandler();
    new TitleAnimation();
    new ThemeToggle();
    new LanguageToggle();
    // 添加頁面載入動畫
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
