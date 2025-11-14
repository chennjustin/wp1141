#!/usr/bin/env node

/**
 * 環境變數檢查腳本
 * 執行: node scripts/check-env.js
 */

const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'DATABASE_URL',
];

console.log('🔍 檢查環境變數設定...\n');

const missing = [];
const present = [];

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    missing.push(varName);
    console.log(`❌ ${varName}: 未設定`);
  } else {
    present.push(varName);
    // 隱藏敏感資訊
    const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD')
      ? '***已設定***'
      : varName === 'DATABASE_URL'
      ? value.replace(/:[^:@]+@/, ':***@') // 隱藏密碼
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (missing.length > 0) {
  console.log('\n⚠️  發現缺少的環境變數：');
  missing.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log('\n請確認：');
  console.log('1. .env 檔案已建立在專案根目錄');
  console.log('2. 所有必要的環境變數都已填入');
  console.log('3. 開發伺服器已重新啟動（環境變數變更需要重啟）');
  process.exit(1);
} else {
  console.log('\n✅ 所有必要的環境變數都已設定！');
  console.log('\n下一步：');
  console.log('1. 確認資料庫已啟動且可連線');
  console.log('2. 執行: npm run db:generate');
  console.log('3. 執行: npm run db:push');
  console.log('4. 啟動開發伺服器: npm run dev');
}

