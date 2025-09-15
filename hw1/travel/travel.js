"use strict";
// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）
// 目的地導航功能
class DestinationNavigation {
    constructor() {
        this.destinationSelection = document.getElementById('destinationSelection');
        this.japanModal = document.getElementById('japanModal');
        this.hongkongMacauModal = document.getElementById('hongkongMacauModal');
        this.australiaModal = document.getElementById('australiaModal');
        this.init();
    }
    init() {
        this.setupDestinationCards();
    }
    setupDestinationCards() {
        const destinationCards = document.querySelectorAll('.destination-card');
        destinationCards.forEach((card) => {
            card.addEventListener('click', () => {
                const destination = card.getAttribute('data-destination');
                if (destination) {
                    this.showTravelModal(destination);
                }
            });
        });
    }
    showTravelModal(destination) {
        var _a, _b, _c;
        if (destination === 'japan') {
            (_a = this.japanModal) === null || _a === void 0 ? void 0 : _a.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        else if (destination === 'hongkong-macau') {
            (_b = this.hongkongMacauModal) === null || _b === void 0 ? void 0 : _b.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        else if (destination === 'australia') {
            (_c = this.australiaModal) === null || _c === void 0 ? void 0 : _c.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    closeModal() {
        // 關閉所有modal
        if (this.japanModal) {
            this.japanModal.classList.remove('active');
        }
        if (this.hongkongMacauModal) {
            this.hongkongMacauModal.classList.remove('active');
        }
        if (this.australiaModal) {
            this.australiaModal.classList.remove('active');
        }
        document.body.style.overflow = 'auto'; // 恢復背景滾動
    }
}
// 滾動動畫功能（Travel頁面專用）
class TravelScrollAnimations {
    constructor() {
        this.cardObserver = null;
        this.timelineObserver = null;
        this.elements = document.querySelectorAll('.fade-in, .timeline-block, .hero-title, .destination-card');
        this.init();
    }
    init() {
        this.setupScrollObserver();
        this.addFadeInClass();
        this.setupTimelineAnimations();
    }
    addFadeInClass() {
        this.elements.forEach((element) => {
            element.classList.add('fade-in');
        });
    }
    setupScrollObserver() {
        this.cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        this.elements.forEach((element) => {
            var _a;
            (_a = this.cardObserver) === null || _a === void 0 ? void 0 : _a.observe(element);
        });
    }
    setupTimelineAnimations() {
        this.timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.classList.contains('timeline-block')) {
                        // 動畫顯示整個timeline block
                        element.classList.add('animate');
                        // 延遲顯示該block的內容
                        const content = element.querySelector('.timeline-content');
                        if (content && content.classList.contains('active')) {
                            const photoPairs = content.querySelectorAll('.photo-caption-pair');
                            photoPairs.forEach((pair, index) => {
                                setTimeout(() => {
                                    pair.classList.add('animate');
                                }, index * 200);
                            });
                            const summary = content.querySelector('.day-summary');
                            if (summary) {
                                setTimeout(() => {
                                    summary.classList.add('animate');
                                }, photoPairs.length * 200);
                            }
                        }
                    }
                    else if (element.classList.contains('photo-caption-pair')) {
                        // 個別photo caption pair動畫
                        element.classList.add('animate');
                    }
                    else if (element.classList.contains('day-summary')) {
                        // 總結動畫
                        element.classList.add('animate');
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });
        // 觀察所有timeline相關元素
        const timelineElements = document.querySelectorAll('.timeline-block, .photo-caption-pair, .day-summary');
        timelineElements.forEach((element) => {
            var _a;
            (_a = this.timelineObserver) === null || _a === void 0 ? void 0 : _a.observe(element);
        });
    }
}
// 返回頂部按鈕
class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.init();
    }
    init() {
        if (this.button) {
            this.setupScrollListener();
            this.setupClickHandler();
        }
    }
    setupScrollListener() {
        window.addEventListener('scroll', () => {
            if (this.button) {
                if (window.scrollY > 300) {
                    this.button.classList.add('show');
                }
                else {
                    this.button.classList.remove('show');
                }
            }
        });
    }
    setupClickHandler() {
        if (this.button) {
            this.button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
}
// 時間軸手風琴功能
class TimelineAccordion {
    constructor() {
        this.currentOpenDay = null;
        this.init();
    }
    init() {
        // 不需要添加事件監聽器，因為HTML中已經有onclick
    }
    toggleDay(dayNumber) {
        const timelineBlock = document.querySelector(`[data-day="${dayNumber}"]`);
        const preview = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-preview');
        const content = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-content');
        if (!timelineBlock || !preview || !content)
            return;
        // 如果點擊的是當前已展開的天數，則收合
        if (this.currentOpenDay === dayNumber) {
            this.closeDay(dayNumber);
            this.currentOpenDay = null;
            return;
        }
        // 關閉其他已展開的天數
        if (this.currentOpenDay) {
            this.closeDay(this.currentOpenDay);
        }
        // 展開選中的天數
        this.openDay(dayNumber);
        this.currentOpenDay = dayNumber;
    }
    openDay(dayNumber) {
        const timelineBlock = document.querySelector(`[data-day="${dayNumber}"]`);
        const preview = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-preview');
        const content = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-content');
        if (!timelineBlock || !preview || !content)
            return;
        // 添加展開狀態的class
        preview.classList.add('active');
        content.classList.add('active');
        // 顯示內容
        content.style.display = 'block';
        // 延遲動畫photo caption pairs
        setTimeout(() => {
            const photoPairs = content.querySelectorAll('.photo-caption-pair');
            photoPairs.forEach((pair, index) => {
                setTimeout(() => {
                    pair.classList.add('animate');
                }, index * 200);
            });
            const summary = content.querySelector('.day-summary');
            if (summary) {
                setTimeout(() => {
                    summary.classList.add('animate');
                }, photoPairs.length * 200);
            }
        }, 100);
    }
    closeDay(dayNumber) {
        const timelineBlock = document.querySelector(`[data-day="${dayNumber}"]`);
        const preview = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-preview');
        const content = timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.querySelector('.timeline-content');
        if (!timelineBlock || !preview || !content)
            return;
        // 移除展開狀態的class
        preview.classList.remove('active');
        content.classList.remove('active');
        // 隱藏內容
        content.style.display = 'none';
        // 重置動畫狀態
        const photoPairs = content.querySelectorAll('.photo-caption-pair');
        const summary = content.querySelector('.day-summary');
        photoPairs.forEach((pair) => {
            pair.classList.remove('animate');
        });
        if (summary) {
            summary.classList.remove('animate');
        }
    }
}
// 照片懸停效果
class PhotoHoverEffects {
    constructor() {
        this.init();
    }
    init() {
        this.setupHoverEffects();
    }
    setupHoverEffects() {
        const photos = document.querySelectorAll('.day-photo, .cover-photo, .destination-photo');
        photos.forEach((photo) => {
            photo.addEventListener('mouseenter', () => {
                photo.style.transform = 'scale(1.05)';
            });
            photo.addEventListener('mouseleave', () => {
                photo.style.transform = 'scale(1)';
            });
        });
    }
}
// 全域變數
let destinationNav = null;
let timelineAccordion = null;
// 全域函數
function selectDestination(destination) {
    if (destinationNav) {
        destinationNav.showTravelModal(destination);
    }
}
function closeTravelModal() {
    if (destinationNav) {
        destinationNav.closeModal();
    }
}
// 時間軸切換功能
function toggleDayBlock(dayNumber) {
    if (timelineAccordion) {
        timelineAccordion.toggleDay(dayNumber);
    }
}
// 返回目的地選擇
function goBackToDestinations() {
    // 隱藏所有旅行詳情頁面
    const travelDetailPages = document.querySelectorAll('.travel-detail');
    travelDetailPages.forEach((page) => {
        page.classList.remove('active');
    });
    // 顯示旅行列表頁面
    const travelPage = document.getElementById('travel');
    if (travelPage) {
        travelPage.classList.add('active');
        // 添加返回動畫
        travelPage.style.opacity = '0';
        travelPage.style.transform = 'translateY(30px)';
        setTimeout(() => {
            travelPage.style.transition = 'all 0.6s ease';
            travelPage.style.opacity = '1';
            travelPage.style.transform = 'translateY(0)';
        }, 100);
    }
}
// 頁面載入完成後初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 注意：Navigation, ThemeToggle 已在 script.ts 中初始化
    destinationNav = new DestinationNavigation();
    timelineAccordion = new TimelineAccordion();
    new TravelScrollAnimations();
    new BackToTop();
    new PhotoHoverEffects();
    // 添加頁面載入動畫
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    // 初始化時間軸動畫
    const timelineBlocks = document.querySelectorAll('.timeline-block');
    timelineBlocks.forEach((block) => {
        block.classList.add('fade-in');
    });
    // 初始化目的地卡片動畫
    const destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.animationDelay = `${index * 0.2}s`;
    });
});
// 處理頁面可見性變化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 頁面隱藏時暫停動畫
        document.body.style.animationPlayState = 'paused';
    }
    else {
        // 頁面顯示時恢復動畫
        document.body.style.animationPlayState = 'running';
    }
});
// 處理鍵盤導航
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // ESC鍵可以關閉展開的天數或返回目的地選擇
        const activeContent = document.querySelector('.timeline-content.active');
        if (activeContent) {
            const timelineBlock = activeContent.closest('.timeline-block');
            const dayNumber = parseInt((timelineBlock === null || timelineBlock === void 0 ? void 0 : timelineBlock.getAttribute('data-day')) || '0');
            if (dayNumber > 0) {
                toggleDayBlock(dayNumber);
            }
        }
        else {
            // 如果在詳細頁面，返回目的地選擇
            goBackToDestinations();
        }
    }
});
// 處理視窗大小變化
window.addEventListener('resize', () => {
    // 重新計算動畫
    const timelineBlocks = document.querySelectorAll('.timeline-block');
    timelineBlocks.forEach((block) => {
        if (block.classList.contains('animate')) {
            block.classList.remove('animate');
            setTimeout(() => {
                block.classList.add('animate');
            }, 50);
        }
    });
});
