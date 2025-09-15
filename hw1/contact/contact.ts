// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）

// 滾動動畫功能（Contact頁面專用）
class ContactScrollAnimations {
  private elements: NodeListOf<Element>;
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.elements = document.querySelectorAll('.fade-in, .contact-card, .contact-form-container');
    this.init();
  }

  init(): void {
    this.setupScrollObserver();
    this.addFadeInClass();
  }

  private addFadeInClass(): void {
    this.elements.forEach((element: any) => {
      element.classList.add('fade-in');
    });
  }

  private setupScrollObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    this.elements.forEach((element: any) => {
      this.observer?.observe(element);
    });
  }
}

// 表單處理功能
class ContactForm {
  private form: HTMLFormElement | null;

  constructor() {
    this.form = document.getElementById('contactForm') as HTMLFormElement | null;
    this.init();
  }

  init(): void {
    if (this.form) {
      this.setupFormValidation();
      this.setupFormSubmission();
    }
  }

  private setupFormValidation(): void {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach((input: any) => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  private validateField(field: any): boolean {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    this.clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
      errorMessage = '此欄位為必填';
      isValid = false;
    } else if (field.type === 'email' && value) {
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

  private showFieldError(field: any, message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.9rem; margin-top: 0.5rem;';
    
    field.style.borderColor = '#e74c3c';
    (field.parentNode as any)?.appendChild(errorDiv);
  }

  private clearFieldError(field: any): void {
    field.style.borderColor = '#ecf0f1';
    const existingError = (field.parentNode as any)?.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  private setupFormSubmission(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      
      const inputs = this.form!.querySelectorAll('input, textarea');
      let isFormValid = true;

      inputs.forEach((input: any) => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        this.submitForm();
      }
    });
  }

  private submitForm(): void {
    this.showSuccessMessage();
    if (this.form) {
      this.form.reset();
    }
  }

  private showSuccessMessage(): void {
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
