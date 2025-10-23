/**
 * 路線管理路由
 * 處理路線的建立、讀取、刪除等操作
 */

import express from 'express';
import { Route } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { geocodeAddress, getBikeRoute, getElevationData, calculateElevationGain } from '../services/googleMaps.js';

const router = express.Router();

// 所有路線路由都需要認證
router.use(authenticateToken);

/**
 * POST /api/routes
 * 建立新路線
 */
router.post('/', async (req, res) => {
  try {
    const { name, startAddress, endAddress, waypoints } = req.body;
    const userId = req.user.userId;

    // 驗證輸入
    if (!name || !startAddress || !endAddress) {
      return res.status(400).json({ error: '請提供路線名稱、起點和終點' });
    }

    // 地理編碼：取得起點和終點座標
    const [startLocation, endLocation] = await Promise.all([
      geocodeAddress(startAddress),
      geocodeAddress(endAddress)
    ]);

    // 處理途徑點
    let waypointLocations = [];
    if (waypoints && waypoints.length > 0) {
      waypointLocations = await Promise.all(
        waypoints.map(wp => geocodeAddress(wp))
      );
    }

    // 取得自行車路線
    const routeData = await getBikeRoute(
      startLocation.lat,
      startLocation.lng,
      endLocation.lat,
      endLocation.lng,
      waypointLocations
    );

    // 取得海拔資料
    const elevations = await getElevationData(routeData.coordinates);
    const elevationGain = calculateElevationGain(elevations);

    // 儲存路線到資料庫
    const savedRoute = await Route.create({
      userId,
      name,
      startLat: startLocation.lat,
      startLng: startLocation.lng,
      startAddress: startLocation.address,
      endLat: endLocation.lat,
      endLng: endLocation.lng,
      endAddress: endLocation.address,
      waypoints: waypointLocations,
      distance: routeData.distance,
      duration: routeData.duration,
      elevationGain,
      polyline: routeData.polyline
    });

    // 回傳完整的路線資訊
    res.status(201).json({
      message: '路線建立成功',
      route: {
        id: savedRoute.id,
        name,
        startLocation,
        endLocation,
        waypoints: waypointLocations,
        distance: routeData.distance,
        duration: routeData.duration,
        elevationGain,
        polyline: routeData.polyline,
        steps: routeData.steps,
        elevations
      }
    });
  } catch (error) {
    console.error('建立路線錯誤:', error);
    res.status(500).json({ error: error.message || '建立路線失敗' });
  }
});

/**
 * GET /api/routes
 * 取得目前使用者的所有路線
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const routes = await Route.findByUserId(userId);

    res.json({
      routes: routes.map(route => ({
        id: route.id,
        name: route.name,
        startLat: route.start_lat,
        startLng: route.start_lng,
        startAddress: route.start_address,
        endLat: route.end_lat,
        endLng: route.end_lng,
        endAddress: route.end_address,
        waypoints: route.waypoints,
        distance: route.distance,
        duration: route.duration,
        elevationGain: route.elevation_gain,
        polyline: route.polyline,
        createdAt: route.created_at
      }))
    });
  } catch (error) {
    console.error('取得路線列表錯誤:', error);
    res.status(500).json({ error: '取得路線列表失敗' });
  }
});

/**
 * GET /api/routes/:id
 * 取得特定路線的詳細資訊
 */
router.get('/:id', async (req, res) => {
  try {
    const routeId = req.params.id;
    const userId = req.user.userId;

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({ error: '路線不存在' });
    }

    // 檢查路線是否屬於目前使用者
    if (route.user_id !== userId) {
      return res.status(403).json({ error: '無權存取此路線' });
    }

    res.json({
      route: {
        id: route.id,
        name: route.name,
        startLat: route.start_lat,
        startLng: route.start_lng,
        startAddress: route.start_address,
        endLat: route.end_lat,
        endLng: route.end_lng,
        endAddress: route.end_address,
        waypoints: route.waypoints,
        distance: route.distance,
        duration: route.duration,
        elevationGain: route.elevation_gain,
        polyline: route.polyline,
        createdAt: route.created_at
      }
    });
  } catch (error) {
    console.error('取得路線詳情錯誤:', error);
    res.status(500).json({ error: '取得路線詳情失敗' });
  }
});

/**
 * PATCH /api/routes/:id
 * 更新路線名稱
 */
router.patch('/:id', async (req, res) => {
  try {
    const routeId = req.params.id;
    const userId = req.user.userId;
    const { name } = req.body;

    // 驗證輸入
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: '路線名稱不能為空' });
    }

    // 檢查路線是否存在且屬於目前使用者
    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({ error: '路線不存在' });
    }

    if (existingRoute.user_id !== userId) {
      return res.status(403).json({ error: '無權修改此路線' });
    }

    // 更新路線名稱
    const updated = await Route.updateName(routeId, userId, name.trim());

    if (!updated) {
      return res.status(500).json({ error: '更新路線名稱失敗' });
    }

    // 回傳更新後的資料
    res.json({
      message: '路線名稱更新成功',
      route: {
        id: parseInt(routeId),
        name: name.trim()
      }
    });
  } catch (error) {
    console.error('更新路線名稱錯誤:', error);
    res.status(500).json({ error: '更新路線名稱失敗' });
  }
});

/**
 * DELETE /api/routes/:id
 * 刪除路線
 */
router.delete('/:id', async (req, res) => {
  try {
    const routeId = req.params.id;
    const userId = req.user.userId;

    const result = await Route.delete(routeId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: '路線不存在或無權刪除' });
    }

    res.json({ message: '路線刪除成功' });
  } catch (error) {
    console.error('刪除路線錯誤:', error);
    res.status(500).json({ error: '刪除路線失敗' });
  }
});

export default router;
