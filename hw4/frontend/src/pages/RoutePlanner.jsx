/**
 * 路線規劃頁面
 * 主要功能：輸入起點、終點和途徑點，規劃自行車路線
 */

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { routeAPI } from '../services/api';
import './RoutePlanner.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 25.0330,
  lng: 121.5654
};

export default function RoutePlanner() {
  const [routeName, setRouteName] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [waypointInput, setWaypointInput] = useState('');
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  // 載入 Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
    libraries
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  // 新增途徑點
  const handleAddWaypoint = () => {
    if (waypointInput.trim()) {
      setWaypoints([...waypoints, waypointInput.trim()]);
      setWaypointInput('');
    }
  };

  // 刪除途徑點
  const handleRemoveWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  // 規劃路線
  const handlePlanRoute = async () => {
    if (!routeName || !startAddress || !endAddress) {
      setError('請填寫路線名稱、起點和終點');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await routeAPI.createRoute({
        name: routeName,
        startAddress,
        endAddress,
        waypoints
      });

      setRoute(data.route);
      setSuccess('路線規劃成功！');
      
      // 重置表單
      setRouteName('');
      setStartAddress('');
      setEndAddress('');
      setWaypoints([]);
    } catch (err) {
      setError(err.response?.data?.error || '路線規劃失敗');
    } finally {
      setLoading(false);
    }
  };

  // 解碼 polyline
  const decodePolyline = (encoded) => {
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

      coordinates.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
    }

    return coordinates;
  };

  // 根據海拔給路線分段著色
  const getColorForElevation = (elevation) => {
    if (elevation < 50) return '#00FF00'; // 綠色：平地
    if (elevation < 100) return '#FFFF00'; // 黃色：緩坡
    if (elevation < 200) return '#FFA500'; // 橙色：中坡
    if (elevation < 300) return '#FF4500'; // 橙紅色：陡坡
    return '#FF0000'; // 紅色：很陡
  };

  if (!isLoaded) {
    return <div className="loading">載入地圖中...</div>;
  }

  return (
    <div className="route-planner">
      <div className="planner-sidebar">
        <h2>🚴 規劃新路線</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label>路線名稱</label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="例如：上班路線"
          />
        </div>
        
        <div className="form-group">
          <label>起點</label>
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="請輸入起點地址"
          />
        </div>
        
        <div className="form-group">
          <label>終點</label>
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            placeholder="請輸入終點地址"
          />
        </div>
        
        <div className="form-group">
          <label>途徑點（選用）</label>
          <div className="waypoint-input">
            <input
              type="text"
              value={waypointInput}
              onChange={(e) => setWaypointInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWaypoint()}
              placeholder="輸入途徑點地址"
            />
            <button onClick={handleAddWaypoint} type="button">新增</button>
          </div>
          {waypoints.length > 0 && (
            <div className="waypoints-list">
              {waypoints.map((wp, index) => (
                <div key={index} className="waypoint-item">
                  <span>{wp}</span>
                  <button onClick={() => handleRemoveWaypoint(index)} type="button">刪除</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handlePlanRoute}
          disabled={loading}
          className="plan-btn"
        >
          {loading ? '規劃中...' : '🚴 規劃路線'}
        </button>
        
        {route && (
          <div className="route-info">
            <h3>路線資訊</h3>
            <p><strong>距離：</strong>{(route.distance / 1000).toFixed(2)} 公里</p>
            <p><strong>預計時間：</strong>{Math.round(route.duration / 60)} 分鐘</p>
            <p><strong>海拔爬升：</strong>{route.elevationGain} 公尺</p>
          </div>
        )}
      </div>
      
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={route?.startLocation || defaultCenter}
          zoom={13}
          onLoad={onMapLoad}
        >
          {route && (
            <>
              {/* 起點標記 */}
              <Marker
                position={route.startLocation}
                label="起點"
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }}
              />
              
              {/* 終點標記 */}
              <Marker
                position={route.endLocation}
                label="終點"
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
              
              {/* 途徑點標記 */}
              {route.waypoints?.map((wp, index) => (
                <Marker
                  key={index}
                  position={wp}
                  label={`途徑${index + 1}`}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                />
              ))}
              
              {/* 路線 polyline */}
              {route.polyline && (
                <Polyline
                  path={decodePolyline(route.polyline)}
                  options={{
                    strokeColor: '#4285F4',
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
