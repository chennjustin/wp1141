// 引入共用類（Navigation, ThemeToggle, ScrollAnimations 在 script.ts 中定義）
// 滾動動畫功能（About頁面專用）
class AboutScrollAnimations {
  private observer: IntersectionObserver | null;
  private elements: NodeListOf<Element>;

  constructor() {
    this.observer = null;
    this.elements = document.querySelectorAll('.fade-in, .info-card, .experience-item, .interest-card');
    this.init();
  }

  init(): void {
    this.setupScrollObserver();
    this.addFadeInClass();
  }

  private addFadeInClass(): void {
    this.elements.forEach((element) => {
      element.classList.add('fade-in');
    });
  }

  private setupScrollObserver(): void {
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
      this.observer?.observe(element);
    });
  }
}

// 進度條動畫
class ProgressBarAnimation {
  private progressBars: NodeListOf<Element>;

  constructor() {
    this.progressBars = document.querySelectorAll('.progress-fill');
    this.init();
  }

  init(): void {
    this.setupScrollTrigger();
  }

  private setupScrollTrigger(): void {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

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

  private animateProgressBars(): void {
    this.progressBars.forEach((bar, index) => {
      setTimeout(() => {
        this.animateProgressBar(bar as HTMLElement);
      }, index * 200);
    });
  }

  private animateProgressBar(element: HTMLElement): void {
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
  private copyButtons: NodeListOf<Element>;

  constructor() {
    this.copyButtons = document.querySelectorAll('.copy-btn');
    this.init();
  }

  init(): void {
    this.setupCopyButtons();
  }

  private setupCopyButtons(): void {
    this.copyButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const contactItem = button.closest('.contact-item');
        const copyText = contactItem?.getAttribute('data-copy');
        if (copyText) {
          this.copyToClipboard(copyText);
          this.showCopyFeedback(button as HTMLElement);
        }
      });
    });
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private showCopyFeedback(button: HTMLElement): void {
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