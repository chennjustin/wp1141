import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 所有路由都需要認證
router.use(authenticateToken);

// 初始化 Google Maps 客戶端
const googleMapsClient = new Client({});

// 地理編碼（地址轉座標）
router.post('/geocode', async (req, res): Promise<void> => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供地址'
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

    const response = await googleMapsClient.geocode({
      params: {
        address,
        key: apiKey
      }
    });

    const results = response.data.results
      .filter(result => result.geometry && result.geometry.location)
      .map(result => ({
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          }
        },
        place_id: result.place_id,
        types: result.types
      }));

    res.json({
      message: '地理編碼成功',
      data: results
    });
  } catch (error) {
    console.error('地理編碼錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '地理編碼過程中發生錯誤'
    });
  }
});

// 反向地理編碼（座標轉地址）
router.post('/reverse-geocode', async (req, res): Promise<void> => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供經緯度座標'
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

    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: { lat: parseFloat(lat), lng: parseFloat(lng) },
        key: apiKey
      }
    });

    const results = response.data.results.map(result => ({
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types
    }));

    res.json({
      message: '反向地理編碼成功',
      data: results
    });
  } catch (error) {
    console.error('反向地理編碼錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '反向地理編碼過程中發生錯誤'
    });
  }
});

// 搜尋附近地點
router.post('/nearby-search', async (req, res): Promise<void> => {
  try {
    const { lat, lng, radius = 1000, type } = req.body;

    if (!lat || !lng) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供經緯度座標'
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

    const response = await googleMapsClient.placesNearby({
      params: {
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseInt(radius),
        type: type || undefined,
        key: apiKey
      }
    });

    const results = response.data.results.map(place => ({
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      geometry: place.geometry,
      rating: place.rating,
      types: place.types
    }));

    res.json({
      message: '搜尋附近地點成功',
      data: results
    });
  } catch (error) {
    console.error('搜尋附近地點錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '搜尋附近地點時發生錯誤'
    });
  }
});

// 取得路線規劃
router.post('/directions', async (req, res): Promise<void> => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      res.status(400).json({
        error: 'Bad Request',
        message: '請提供起點和終點'
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

    const response = await googleMapsClient.directions({
      params: {
        origin,
        destination,
        mode: mode as any,
        key: apiKey
      }
    });

    const routes = response.data.routes.map(route => ({
      summary: route.summary,
      legs: route.legs.map(leg => ({
        distance: leg.distance,
        duration: leg.duration,
        start_address: leg.start_address,
        end_address: leg.end_address,
        steps: leg.steps.map(step => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.html_instructions,
          maneuver: step.maneuver
        }))
      }))
    }));

    res.json({
      message: '路線規劃成功',
      data: routes
    });
  } catch (error) {
    console.error('路線規劃錯誤:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '路線規劃過程中發生錯誤'
    });
  }
});

export default router;