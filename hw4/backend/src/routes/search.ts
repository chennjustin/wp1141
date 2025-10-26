import express from 'express';
import axios from 'axios';
import { sendSuccess, sendError, sendServerError } from '../utils/response';
// import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 新版 Places API (New) 基礎 URL
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1/places';

// 測試模式：暫時不需要認證
// router.use(authenticateToken);

// 建立 HTTP 請求的輔助函數
const makePlacesApiRequest = async (endpoint: string, data: any) => {
  const apiKey = process.env['GOOGLE_MAPS_SERVER_KEY'];
  
  if (!apiKey) {
    throw new Error('Google Maps API Key 未設定');
  }

  const response = await axios.post(`${PLACES_API_BASE_URL}${endpoint}`, data, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos',
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data;
};

// 文字搜尋地點 - 使用新版 Places API (New)
router.post('/text-search', async (req, res) => {
  try {
    const { query, location, radius = 5000, type } = req.body;

    console.log('收到搜尋請求:', { query, location, radius, type });

    if (!query) {
      sendError(res, '請提供搜尋關鍵字', 400);
      return;
    }

    console.log('開始調用新版 Google Places API (New)...');
    
    // 新版 Places API (New) 請求格式
    const requestData: any = {
      textQuery: query,
      maxResultCount: 20,
      languageCode: 'zh-TW'
    };

    // 如果有位置資訊，加入位置偏好
    if (location && location.lat && location.lng) {
      requestData.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: radius
        }
      };
    }

    // 如果有類型篩選
    if (type) {
      requestData.includedType = type;
    }

    const response = await makePlacesApiRequest(':searchText', requestData);

    console.log('新版 Places API 回應:', response.places?.length || 0, '個結果');

    const places = (response.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || '未知地點',
      vicinity: place.formattedAddress || '',
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0
        }
      },
      rating: place.rating || 0,
      user_rating_total: place.userRatingCount || 0,
      types: place.types || [],
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.name,
        height: photo.heightPx,
        width: photo.widthPx
      })) || []
    }));

    sendSuccess(res, places, '搜尋成功');
  } catch (error: any) {
    console.error('搜尋失敗:', error);
    
    if (error.message?.includes('API Key 未設定')) {
      sendError(res, 'Google Maps API Key 未設定', 500);
    } else if (error.response?.data) {
      sendError(res, `Google API 錯誤: ${error.response.data.error?.message || '未知錯誤'}`, 500);
    } else {
      sendServerError(res, '搜尋失敗');
    }
  }
});

// 附近搜尋地點 - 使用新版 Places API (New)
router.post('/nearby-search', async (req, res) => {
  try {
    const { location, radius = 1000, type } = req.body;

    console.log('收到附近搜尋請求:', { location, radius, type });

    if (!location || !location.lat || !location.lng) {
      sendError(res, '請提供位置資訊', 400);
      return;
    }

    console.log('開始調用新版 Google Places API (New) 附近搜尋...');
    
    // 新版 Places API (New) 附近搜尋請求格式
    const requestData: any = {
      locationRestriction: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: radius
        }
      },
      maxResultCount: 20,
      languageCode: 'zh-TW'
    };

    // 如果有類型篩選
    if (type) {
      requestData.includedType = type;
    }

    const response = await makePlacesApiRequest(':searchNearby', requestData);

    console.log('新版 Places API 附近搜尋回應:', response.places?.length || 0, '個結果');

    const places = (response.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || '未知地點',
      vicinity: place.formattedAddress || '',
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0
        }
      },
      rating: place.rating || 0,
      user_rating_total: place.userRatingCount || 0,
      types: place.types || [],
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.name,
        height: photo.heightPx,
        width: photo.widthPx
      })) || []
    }));

    sendSuccess(res, places, '附近搜尋成功');
  } catch (error: any) {
    console.error('附近搜尋失敗:', error);
    
    if (error.message?.includes('API Key 未設定')) {
      sendError(res, 'Google Maps API Key 未設定', 500);
    } else if (error.response?.data) {
      sendError(res, `Google API 錯誤: ${error.response.data.error?.message || '未知錯誤'}`, 500);
    } else {
      sendServerError(res, '附近搜尋失敗');
    }
  }
});

// 取得地點詳細資訊 - 使用新版 Places API (New)
router.get('/place-details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      sendError(res, '請提供地點 ID', 400);
      return;
    }

    console.log('取得地點詳細資訊:', placeId);

    const apiKey = process.env['GOOGLE_MAPS_SERVER_KEY'];
    
    if (!apiKey) {
      sendError(res, 'Google Maps API Key 未設定', 500);
      return;
    }

    // 使用新版 Places API (New) 的 GET 方法
    const response = await axios.get(`${PLACES_API_BASE_URL}/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,types,photos,regularOpeningHours,websiteUri,nationalPhoneNumber',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const place = response.data;

    const placeDetails = {
      place_id: place.id,
      name: place.displayName?.text || '未知地點',
      formatted_address: place.formattedAddress || '',
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0
        }
      },
      rating: place.rating || 0,
      user_rating_total: place.userRatingCount || 0,
      types: place.types || [],
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.name,
        height: photo.heightPx,
        width: photo.widthPx
      })) || [],
      opening_hours: place.regularOpeningHours ? {
        open_now: place.regularOpeningHours.openNow,
        weekday_text: place.regularOpeningHours.weekdayDescriptions || []
      } : null,
      website: place.websiteUri || null,
      phone_number: place.nationalPhoneNumber || null
    };

    sendSuccess(res, placeDetails, '取得地點詳細資訊成功');
  } catch (error: any) {
    console.error('取得地點詳細資訊失敗:', error);
    console.error('錯誤詳情:', error.response?.data);
    
    if (error.message?.includes('API Key 未設定')) {
      sendError(res, 'Google Maps API Key 未設定', 500);
    } else if (error.response?.data) {
      console.error('Google API 錯誤回應:', error.response.data);
      sendError(res, `Google API 錯誤: ${error.response.data.error?.message || '未知錯誤'}`, 500);
    } else {
      sendServerError(res, '取得地點詳細資訊失敗');
    }
  }
});

export default router;