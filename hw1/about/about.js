"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）
// 滾動動畫功能（About頁面專用）
class AboutScrollAnimations {
    constructor() {
        this.observer = null;
        this.elements = document.querySelectorAll('.fade-in, .info-card, .experience-item, .interest-card');
        this.init();
    }
    init() {
        this.setupScrollObserver();
        this.addFadeInClass();
    }
    addFadeInClass() {
        this.elements.forEach((element) => {
            element.classList.add('fade-in');
        });
    }
    setupScrollObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        this.elements.forEach((element) => {
            var _a;
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.observe(element);
        });
    }
}
// 進度條動畫
class ProgressBarAnimation {
    constructor() {
        this.progressBars = document.querySelectorAll('.progress-fill');
        this.init();
    }
    init() {
        this.setupScrollTrigger();
    }
    setupScrollTrigger() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection)
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateProgressBars();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(aboutSection);
    }
    animateProgressBars() {
        this.progressBars.forEach((bar, index) => {
            setTimeout(() => {
                this.animateProgressBar(bar);
            }, index * 200);
        });
    }
    animateProgressBar(element) {
        const width = element.getAttribute('data-width');
        if (width) {
            setTimeout(() => {
                element.style.width = width + '%';
            }, 200);
        }
    }
}
// 複製功能
class ClipboardHelper {
    constructor() {
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.init();
    }
    init() {
        this.setupCopyButtons();
    }
    setupCopyButtons() {
        this.copyButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const contactItem = button.closest('.contact-item');
                const copyText = contactItem === null || contactItem === void 0 ? void 0 : contactItem.getAttribute('data-copy');
                if (copyText) {
                    this.copyToClipboard(copyText);
                    this.showCopyFeedback(button);
                }
            });
        });
    }
    copyToClipboard(text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(text);
            }
            catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        });
    }
    showCopyFeedback(button) {
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
        }, 2000);
    }
}
// 頁面載入完成後初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 注意：Navigation, ThemeToggle 已在 script.ts 中初始化
    new AboutScrollAnimations();
    new ProgressBarAnimation();
    new ClipboardHelper();
    // 添加頁面載入動畫
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
