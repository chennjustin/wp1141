"use strict";
// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）
// 滾動動畫功能（Contact頁面專用）
class ContactScrollAnimations {
    constructor() {
        this.observer = null;
        this.elements = document.querySelectorAll('.fade-in, .contact-card, .contact-form-container');
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
// 表單處理功能
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }
    init() {
        if (this.form) {
            this.setupFormValidation();
            this.setupFormSubmission();
        }
    }
    setupFormValidation() {
        if (!this.form)
            return;
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach((input) => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        this.clearFieldError(field);
        if (field.hasAttribute('required') && !value) {
            errorMessage = '此欄位為必填';
            isValid = false;
        }
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = '請輸入有效的電子郵件地址';
                isValid = false;
            }
        }
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        return isValid;
    }
    showFieldError(field, message) {
        var _a;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.9rem; margin-top: 0.5rem;';
        field.style.borderColor = '#e74c3c';
        (_a = field.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(errorDiv);
    }
    clearFieldError(field) {
        var _a;
        field.style.borderColor = '#ecf0f1';
        const existingError = (_a = field.parentNode) === null || _a === void 0 ? void 0 : _a.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    setupFormSubmission() {
        if (!this.form)
            return;
        this.form.addEventListener('submit', (e) => {
            var _a;
            e.preventDefault();
            const inputs = (_a = this.form) === null || _a === void 0 ? void 0 : _a.querySelectorAll('input, textarea');
            let isFormValid = true;
            inputs === null || inputs === void 0 ? void 0 : inputs.forEach((input) => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                this.submitForm();
            }
        });
    }
    submitForm() {
        this.showSuccessMessage();
        if (this.form) {
            this.form.reset();
        }
    }
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
      <div style="
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        margin-top: 1rem;
        animation: slideIn 0.3s ease;
      ">
        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
        訊息已成功發送！我會盡快回覆您。
      </div>
    `;
        if (this.form) {
            this.form.appendChild(successDiv);
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }
}
// 頁面載入完成後初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 注意：Navigation, ThemeToggle 已在 script.ts 中初始化
    new ContactScrollAnimations();
    new ContactForm();
    // 添加頁面載入動畫
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
