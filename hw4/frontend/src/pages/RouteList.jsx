/**
 * 路線列表頁面
 * 顯示使用者儲存的所有路線
 */

import { useState, useEffect } from 'react';
import { routeAPI } from '../services/api';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import './RouteList.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
    libraries
  });

  // 載入路線列表
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeAPI.getRoutes();
      setRoutes(data.routes);
    } catch (err) {
      setError('載入路線列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 刪除路線
  const handleDeleteRoute = async (id) => {
    if (!confirm('確定要刪除這條路線嗎？')) {
      return;
    }

    try {
      await routeAPI.deleteRoute(id);
      setRoutes(routes.filter(route => route.id !== id));
      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
    } catch (err) {
      alert('刪除失敗');
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

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="route-list-page">
      <h1>📋 我的路線</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {routes.length === 0 ? (
        <div className="empty-state">
          <p>還沒有儲存任何路線</p>
          <p>去規劃一條新路線吧！</p>
        </div>
      ) : (
        <div className="route-list-container">
          <div className="routes-sidebar">
            {routes.map(route => (
              <div
                key={route.id}
                className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                onClick={() => setSelectedRoute(route)}
              >
                <h3>{route.name}</h3>
                <p className="route-address">
                  <strong>起點：</strong>{route.startAddress}
                </p>
                <p className="route-address">
                  <strong>終點：</strong>{route.endAddress}
                </p>
                <div className="route-stats">
                  <span>📏 {(route.distance / 1000).toFixed(2)} km</span>
                  <span>⏱️ {Math.round(route.duration / 60)} min</span>
                  <span>⛰️ {route.elevationGain} m</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoute(route.id);
                  }}
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
          
          {selectedRoute && isLoaded && (
            <div className="route-map">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: selectedRoute.startLat, lng: selectedRoute.startLng }}
                zoom={13}
              >
                <Marker
                  position={{ lat: selectedRoute.startLat, lng: selectedRoute.startLng }}
                  label="起點"
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  }}
                />
                
                <Marker
                  position={{ lat: selectedRoute.endLat, lng: selectedRoute.endLng }}
                  label="終點"
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                />
                
                {selectedRoute.waypoints?.map((wp, index) => (
                  <Marker
                    key={index}
                    position={{ lat: wp.lat, lng: wp.lng }}
                    label={`途徑${index + 1}`}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                  />
                ))}
                
                {selectedRoute.polyline && (
                  <Polyline
                    path={decodePolyline(selectedRoute.polyline)}
                    options={{
                      strokeColor: '#4285F4',
                      strokeWeight: 5,
                      strokeOpacity: 0.8
                    }}
                  />
                )}
              </GoogleMap>
              
              <div className="route-details">
                <h3>{selectedRoute.name}</h3>
                <div className="detail-row">
                  <strong>起點：</strong>
                  <span>{selectedRoute.startAddress}</span>
                </div>
                <div className="detail-row">
                  <strong>終點：</strong>
                  <span>{selectedRoute.endAddress}</span>
                </div>
                {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                  <div className="detail-row">
                    <strong>途徑點：</strong>
                    <ul>
                      {selectedRoute.waypoints.map((wp, index) => (
                        <li key={index}>{wp.address}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="detail-stats">
                  <div className="stat-item">
                    <strong>距離</strong>
                    <span>{(selectedRoute.distance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="stat-item">
                    <strong>預計時間</strong>
                    <span>{Math.round(selectedRoute.duration / 60)} 分鐘</span>
                  </div>
                  <div className="stat-item">
                    <strong>海拔爬升</strong>
                    <span>{selectedRoute.elevationGain} 公尺</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
