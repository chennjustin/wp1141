// 測試 Google Maps API 是否正常運作
const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

const client = new Client({});

async function testGoogleMapsAPI() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
    
    console.log('🔑 API Key 狀態:', apiKey ? '已設定' : '❌ 未設定');
    
    if (!apiKey) {
      console.log('❌ 請在 .env 檔案中設定 GOOGLE_MAPS_SERVER_KEY');
      return;
    }

    console.log('🧪 測試 Google Places API...');
    
    // 測試文字搜尋
    const response = await client.textSearch({
      params: {
        query: '台北101',
        key: apiKey
      },
      timeout: 10000
    });

    console.log('✅ Google Places API 測試成功！');
    console.log('📊 搜尋結果數量:', response.data.results.length);
    
    if (response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      console.log('📍 第一個結果:', {
        name: firstResult.name,
        vicinity: firstResult.vicinity,
        rating: firstResult.rating,
        place_id: firstResult.place_id
      });
    }

  } catch (error) {
    console.error('❌ Google Maps API 測試失敗:');
    console.error('錯誤訊息:', error.message);
    
    if (error.response) {
      console.error('HTTP 狀態:', error.response.status);
      console.error('錯誤詳情:', error.response.data);
    }
  }
}

testGoogleMapsAPI();
