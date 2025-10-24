import express from 'express';
import { Client as GoogleMapsClient, PlaceDetailsResponse, PlacesNearbyResponse, TextSearchResponse } from '@googlemaps/google-maps-services-js';
// import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 初始化 Google Maps 客戶端
const googleMapsClient = new GoogleMapsClient({});

// 測試模式：暫時不需要認證
// router.use(authenticateToken);

// 文字搜尋地點
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

    const apiKey = process.env['GOOGLE_MAPS_SERVER_KEY'];
    console.log('API Key 狀態:', apiKey ? '已設定' : '未設定');
    
    if (!apiKey) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Google Maps API Key 未設定'
      });
      return;
    }

    console.log('開始調用 Google Places API...');
    
    const searchParams: any = {
      query: query,
      key: apiKey
    };

    if (location && location.lat && location.lng) {
      searchParams.location = { lat: location.lat, lng: location.lng };
      searchParams.radius = radius;
    }

    if (type) {
      searchParams.type = type;
    }

    const response: TextSearchResponse = await googleMapsClient.textSearch({
      params: searchParams,
      timeout: 10000
    });

    console.log('Google Places API 回應:', response.data.results.length, '個結果');

    const places = response.data.results
      .filter(place => place.geometry && place.geometry.location)
      .map(place => ({
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        geometry: {
          location: {
            lat: place.geometry!.location.lat,
            lng: place.geometry!.location.lng
          }
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        types: place.types,
        photos: place.photos?.slice(0, 1) // 只取第一張照片
      }));

    res.json({
      message: '文字搜尋成功',
      data: places
    });
    return;
  } catch (error) {
    console.error('文字搜尋錯誤:', error);
    console.error('錯誤詳情:', {
      message: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: '文字搜尋時發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
    return;
  }
});

// 附近搜尋
router.post('/nearby-search', async (req, res): Promise<void> => {
  try {
    const { location, radius = 1000, type, keyword } = req.body;

    if (!location || !location.lat || !location.lng) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供位置座標'
      });
      return;
    }

    const apiKey = process.env['GOOGLE_MAPS_SERVER_KEY'];
    if (!apiKey) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Google Maps API Key 未設定'
      });
      return;
    }

    const response: PlacesNearbyResponse = await googleMapsClient.placesNearby({
      params: {
        location: { lat: location.lat, lng: location.lng },
        radius: radius,
        type: type,
        keyword: keyword,
        key: apiKey
      },
      timeout: 1000
    });

    const places = response.data.results.map(place => ({
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
        geometry: {
          location: {
            lat: place.geometry!.location.lat,
            lng: place.geometry!.location.lng
          }
        },
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
      photos: place.photos?.slice(0, 1)
    }));

    res.json({
      message: '附近搜尋成功',
      data: places
    });
    return;
  } catch (error) {
    console.error('附近搜尋錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '附近搜尋時發生錯誤'
    });
    return;
  }
});

// 取得地點詳細資訊
router.post('/place-details', async (req, res): Promise<void> => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供地點 ID'
      });
      return;
    }

    const apiKey = process.env['GOOGLE_MAPS_SERVER_KEY'];
    if (!apiKey) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Google Maps API Key 未設定'
      });
      return;
    }

    const response: PlaceDetailsResponse = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'types', 'photos', 'website', 'formatted_phone_number'],
        key: apiKey
      },
      timeout: 1000
    });

    const place = response.data.result;
    const placeDetails = {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry!.location.lat,
            lng: place.geometry!.location.lng
          }
        },
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
      website: place.website,
      formatted_phone_number: place.formatted_phone_number,
      photos: place.photos?.slice(0, 3) // 取前三張照片
    };

    res.json({
      message: '地點詳細資訊取得成功',
      data: placeDetails
    });
    return;
  } catch (error) {
    console.error('取得地點詳細資訊錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '取得地點詳細資訊時發生錯誤'
    });
    return;
  }
});

export default router;
