// Navbar 配置檔案 - 從home頁面獲取navbar內容和樣式
// 只有home頁面有navbar HTML，其他頁面通過JavaScript載入

// 從home頁面獲取navbar HTML內容
async function loadNavbarFromHome(): Promise<void> {
  try {
    // 獲取home頁面的HTML
    const response = await fetch('../home/index.html');
    const html = await response.text();
    
    // 解析HTML並提取navbar部分
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const homeNavbar = doc.querySelector('.navbar');
    
    if (homeNavbar) {
      // 在當前頁面插入navbar
      const navbarContainer = document.querySelector('.navbar');
      
      if (navbarContainer) {
        // 替換現有navbar
        navbarContainer.outerHTML = homeNavbar.outerHTML;
      } else {
        // 在body開頭添加navbar
        document.body.insertAdjacentHTML('afterbegin', homeNavbar.outerHTML);
      }
      
      // 載入home頁面的CSS以確保樣式一致
      loadHomeStyles();
      
      // 重新初始化navbar功能
      initializeNavbarFeatures();
    }
  } catch (error) {
    console.error('無法載入navbar:', error);
    // 如果無法載入，使用預設navbar
    createDefaultNavbar();
  }
}

// 載入home頁面的CSS樣式
function loadHomeStyles(): void {
  // 檢查是否已經載入了home的CSS
  if (!document.querySelector('link[href*="home.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../home/home.css';
    document.head.appendChild(link);
  }
}

// 創建預設navbar（備用方案）
function createDefaultNavbar(): void {
  const defaultNavbar = `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <a href="../home/index.html">chccc</a>
        </div>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="../home/index.html" class="nav-link">
              <i class="fas fa-home"></i>
              <span>Home</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="../about/about.html" class="nav-link">
              <i class="fas fa-user"></i>
              <span>About</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="../travel/travel.html" class="nav-link">
              <i class="fas fa-plane"></i>
              <span>Travel</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="../contact/contact.html" class="nav-link">
              <i class="fas fa-envelope"></i>
              <span>Contact</span>
            </a>
          </li>
          <li class="nav-item">
            <button class="theme-toggle" id="themeToggle">
              <i class="fas fa-moon"></i>
            </button>
          </li>
        </ul>
        <div class="hamburger">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </nav>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', defaultNavbar);
}

// 初始化navbar功能
function initializeNavbarFeatures(): void {
  // 重新綁定navbar事件
  setupNavbarScrollEffect();
  setupMobileMenu();
  setupThemeToggle();
  updateActiveNavLink();
}

// 設置navbar滾動效果
function setupNavbarScrollEffect(): void {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// 設置手機選單
function setupMobileMenu(): void {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
}

// 設置主題切換
function setupThemeToggle(): void {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // 載入保存的主題設置
    loadTheme();
    
    themeToggle.addEventListener('click', () => {
      toggleTheme();
    });
  }
}

// 切換主題
function toggleTheme(): void {
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  if (isDarkMode) {
    // 切換到淺色模式
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateThemeIcon('moon');
  } else {
    // 切換到深色模式
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateThemeIcon('sun');
  }
}

// 載入主題設置
function loadTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateThemeIcon('sun');
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeIcon('moon');
  }
}

// 更新主題圖標
function updateThemeIcon(iconType: string): void {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = `fas fa-${iconType}`;
    }
  }
}

// 更新當前頁面的active nav link
function updateActiveNavLink(): void {
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (href && currentPage.includes(href.replace('../', '').replace('/index.html', ''))) {
      link.classList.add('active');
    }
  });
}

// 如果不在home頁面，則載入home的navbar
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 檢查當前是否在home頁面
    const isHomePage = window.location.pathname.includes('/home/') || 
                      window.location.pathname.includes('index.html');
    
    if (!isHomePage) {
      loadNavbarFromHome();
    }
  });
}

