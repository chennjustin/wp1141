import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 測試模式：暫時不需要認證
// router.use(authenticateToken);

// 測試文字搜尋地點（不依賴 Google Maps API）
router.post('/text-search', async (req, res): Promise<void> => {
  try {
    const { query, location, radius = 5000, type } = req.body;

    console.log('收到搜尋請求:', { query, location, radius, type });

    if (!query) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供搜尋關鍵字'
      });
      return;
    }

    // 模擬搜尋結果
    const mockResults = [
      {
        place_id: 'test_1',
        name: `${query} - 搜尋結果 1`,
        vicinity: '台北市',
        geometry: {
          location: {
            lat: 25.0330 + Math.random() * 0.01,
            lng: 121.5654 + Math.random() * 0.01
          }
        },
        rating: 4.0 + Math.random(),
        user_ratings_total: Math.floor(Math.random() * 1000),
        types: [type || 'establishment'],
        photos: []
      },
      {
        place_id: 'test_2',
        name: `${query} - 搜尋結果 2`,
        vicinity: '台北市',
        geometry: {
          location: {
            lat: 25.0330 + Math.random() * 0.01,
            lng: 121.5654 + Math.random() * 0.01
          }
        },
        rating: 4.0 + Math.random(),
        user_ratings_total: Math.floor(Math.random() * 1000),
        types: [type || 'establishment'],
        photos: []
      }
    ];

    console.log('返回模擬搜尋結果:', mockResults.length, '個結果');

    res.json({
      message: '文字搜尋成功（測試模式）',
      data: mockResults
    });
    return;
  } catch (error) {
    console.error('文字搜尋錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '文字搜尋時發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
    return;
  }
});

export default router;
