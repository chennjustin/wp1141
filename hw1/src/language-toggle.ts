// 語言切換功能 - 共用類
export class LanguageToggle {
  private languageToggle: HTMLElement | null;
  private currentLanguage: string;
  private translations: { [key: string]: { [key: string]: string } };

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
        'footer.copyright': '© 2025.09 陳竑齊. 保留所有權利.',
        // About 頁面
        'about.title': 'About Me',
        'about.subtitle': 'Learn more about my journey and experiences',
        'about.contact_info': '聯絡資訊',
        'about.hard_skills': 'Hard Skill',
        'about.soft_skills': 'Soft Skill',
        'about.education': '學歷',
        'about.languages': '語言能力',
        'about.name': '陳竑齊',
        'about.school': '臺灣大學資訊管理學系',
        'about.statement': '我是來自臺大資管的陳竑齊，熱愛排球、攝影、桌遊和收集各種奇怪的吊飾，最近正在學習保持自己的節奏做事，積極參與資訊社群，並擅長團隊協作與專案管理。',
        'about.experience': '活動參與&工作經驗',
        'about.interests': '興趣',
        // Travel 頁面
        'travel.title': 'My Journey',
        'travel.subtitle': 'Explore my journey and travel memories',
        'travel.japan.title': 'Japan',
        'travel.japan.summary': '第一次不是和家人出國，是和朋友一起的旅程...',
        'travel.hk.title': 'Hong Kong & Macau',
        'travel.hk.summary': '成為導遊的港澳六天五夜...',
        'travel.australia.title': 'Australia',
        'travel.australia.summary': 'Coming Soon',
        'travel.explore_more': 'Explore More',
        'travel.coming_soon': 'Coming Soon',
        // Contact 頁面
        'contact.title': 'Contact Me',
        'contact.subtitle': 'Let\'s connect and create something amazing together',
        'contact.email_title': '電子郵件',
        'contact.send_email': '發送郵件',
        'contact.phone_title': '電話',
        'contact.call': '撥打電話',
        'contact.github_title': 'GitHub',
        'contact.github_desc': '查看我的專案作品',
        'contact.visit_github': '訪問 GitHub',
        'contact.linkedin_title': 'LinkedIn',
        'contact.linkedin_desc': '專業網路連結',
        'contact.view_profile': '查看檔案',
        'contact.send_message': '發送訊息',
        'contact.name_placeholder': '您的姓名',
        'contact.email_placeholder': '您的電子郵件',
        'contact.subject_placeholder': '主旨',
        'contact.message_placeholder': '您的訊息',
        'contact.send_button': '發送訊息'
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
        'footer.copyright': '© 2025.09 Hung-Chi Chen. All rights reserved.',
        // About 頁面
        'about.title': 'About Me',
        'about.subtitle': 'Learn more about my journey and experiences',
        'about.contact_info': 'Contact Information',
        'about.hard_skills': 'Hard Skills',
        'about.soft_skills': 'Soft Skills',
        'about.education': 'Education',
        'about.languages': 'Language Skills',
        'about.name': 'Hung-Chi Chen',
        'about.school': 'National Taiwan University, Information Management',
        'about.statement': 'I\'m Hung-Chi Chen from NTU\'s Information Management Department. I love volleyball, photography, board games, and collecting various quirky keychains. Recently, I\'ve been learning to maintain my own pace in work, actively participating in the information community, and I\'m skilled in team collaboration and project management.',
        'about.experience': 'Activities & Work Experience',
        'about.interests': 'Interests',
        // Travel 頁面
        'travel.title': 'My Journey',
        'travel.subtitle': 'Explore my journey and travel memories',
        'travel.japan.title': 'Japan',
        'travel.japan.summary': 'First time traveling abroad not with family, but with friends...',
        'travel.hk.title': 'Hong Kong & Macau',
        'travel.hk.summary': 'Becoming a tour guide for a 6-day, 5-night Hong Kong & Macau trip...',
        'travel.australia.title': 'Australia',
        'travel.australia.summary': 'Coming Soon',
        'travel.explore_more': 'Explore More',
        'travel.coming_soon': 'Coming Soon',
        // Contact 頁面
        'contact.title': 'Contact Me',
        'contact.subtitle': 'Let\'s connect and create something amazing together',
        'contact.email_title': 'Email',
        'contact.send_email': 'Send Email',
        'contact.phone_title': 'Phone',
        'contact.call': 'Call',
        'contact.github_title': 'GitHub',
        'contact.github_desc': 'View my project portfolio',
        'contact.visit_github': 'Visit GitHub',
        'contact.linkedin_title': 'LinkedIn',
        'contact.linkedin_desc': 'Professional network connection',
        'contact.view_profile': 'View Profile',
        'contact.send_message': 'Send Message',
        'contact.name_placeholder': 'Your Name',
        'contact.email_placeholder': 'Your Email',
        'contact.subject_placeholder': 'Subject',
        'contact.message_placeholder': 'Your Message',
        'contact.send_button': 'Send Message'
      }
    };
    this.init();
  }

  init(): void {
    if (this.languageToggle) {
      // 載入保存的語言設置
      this.loadLanguage();
      
      this.languageToggle.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }
  }

  private toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', this.currentLanguage);
    this.updateLanguage();
    this.updateLanguageButton();
  }

  private loadLanguage(): void {
    const savedLanguage = localStorage.getItem('language');
    this.currentLanguage = savedLanguage || 'zh';
    this.updateLanguage();
    this.updateLanguageButton();
  }

  private updateLanguage(): void {
    // 更新一般文本
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-translate');
      if (key && this.translations[this.currentLanguage][key]) {
        element.textContent = this.translations[this.currentLanguage][key];
      }
    });

    // 更新 placeholder 文本
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach((element) => {
      const key = element.getAttribute('data-translate-placeholder');
      if (key && this.translations[this.currentLanguage][key]) {
        (element as HTMLInputElement).placeholder = this.translations[this.currentLanguage][key];
      }
    });
  }

  private updateLanguageButton(): void {
    if (this.languageToggle) {
      const span = this.languageToggle.querySelector('span');
      if (span) {
        span.textContent = this.currentLanguage === 'zh' ? '中' : 'EN';
      }
    }
  }
}
