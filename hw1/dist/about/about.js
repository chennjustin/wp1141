// 導入共用的語言切換類
import { LanguageToggle } from '../src/language-toggle.js';
// 頁面載入完成後初始化語言切換功能
document.addEventListener('DOMContentLoaded', () => {
    new LanguageToggle();
});
