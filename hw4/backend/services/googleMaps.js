/**
 * Google Maps API 整合服務
 * 提供路線規劃、地理編碼和海拔資料功能
 */

import axios from 'axios';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * 地理編碼：將地址轉換為座標
 */
export async function geocodeAddress(address) {
  try {
    const response = await axios.get(`${BASE_URL}/geocode/json`, {
      params: {
        address: address,
        key: GOOGLE_MAPS_SERVER_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;
      
      return {
        lat: location.lat,
        lng: location.lng,
        address: formattedAddress
      };
    } else {
      throw new Error(`地理編碼失敗: ${response.data.status}`);
    }
  } catch (error) {
    console.error('地理編碼錯誤:', error);
    throw error;
  }
}

/**
 * 取得自行車路線
 */
export async function getBikeRoute(startLat, startLng, endLat, endLng, waypoints = []) {
  try {
    // 建構 waypoints 參數
    let waypointsParam = '';
    if (waypoints.length > 0) {
      waypointsParam = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
    }

    const response = await axios.get(`${BASE_URL}/directions/json`, {
      params: {
        origin: `${startLat},${startLng}`,
        destination: `${endLat},${endLng}`,
        waypoints: waypointsParam || undefined,
        mode: 'bicycling',
        key: GOOGLE_MAPS_SERVER_KEY,
        alternatives: false
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      // 提取路線資訊
      const leg = route.legs[0];
      const distance = leg.distance.value; // 公尺
      const duration = leg.duration.value; // 秒
      
      // 取得路線的所有步驟座標
      const steps = leg.steps;
      const coordinates = [];
      
      steps.forEach(step => {
        // 解碼 polyline
        const stepPolyline = decodePolyline(step.polyline.points);
        coordinates.push(...stepPolyline);
      });

      return {
        distance,
        duration,
        polyline: route.overview_polyline.points,
        coordinates,
        steps: steps.map(step => ({
          start: step.start_location,
          end: step.end_location,
          distance: step.distance.value,
          duration: step.duration.value,
          instruction: step.html_instructions
        }))
      };
    } else {
      throw new Error(`路線規劃失敗: ${response.data.status}`);
    }
  } catch (error) {
    console.error('路線規劃錯誤:', error);
    throw error;
  }
}

/**
 * 取得海拔資料
 */
export async function getElevationData(coordinates) {
  try {
    // Google Elevation API 最多一次處理 512 個點
    // 如果座標太多，需要分批處理
    const maxPoints = 512;
    const batches = [];
    
    for (let i = 0; i < coordinates.length; i += maxPoints) {
      const batch = coordinates.slice(i, i + maxPoints);
      batches.push(batch);
    }

    const allElevations = [];

    for (const batch of batches) {
      const locations = batch.map(coord => `${coord.lat},${coord.lng}`).join('|');
      
      const response = await axios.get(`${BASE_URL}/elevation/json`, {
        params: {
          locations: locations,
          key: GOOGLE_MAPS_SERVER_KEY
        }
      });

      if (response.data.status === 'OK') {
        allElevations.push(...response.data.results);
      }
    }

    return allElevations;
  } catch (error) {
    console.error('海拔資料取得錯誤:', error);
    throw error;
  }
}

/**
 * 計算總海拔爬升
 */
export function calculateElevationGain(elevations) {
  let totalGain = 0;
  
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i].elevation - elevations[i - 1].elevation;
    if (diff > 0) {
      totalGain += diff;
    }
  }
  
  return Math.round(totalGain); // 公尺
}

/**
 * 解碼 Google Maps polyline
 */
function decodePolyline(encoded) {
  const coordinates = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push({
      lat: lat * 1e-5,
      lng: lng * 1e-5
    });
  }

  return coordinates;
}
