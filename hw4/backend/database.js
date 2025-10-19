/**
 * 資料庫模型和初始化
 * 使用 SQLite 儲存使用者和路線資料
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// 建立資料庫連線
const db = new sqlite3.Database('./bikeroute.db');

// 將 callback 風格的函式轉換為 Promise
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

/**
 * 初始化資料庫表
 */
export async function initDatabase() {
  try {
    // 建立使用者表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 建立路線表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_lat REAL NOT NULL,
        start_lng REAL NOT NULL,
        start_address TEXT NOT NULL,
        end_lat REAL NOT NULL,
        end_lng REAL NOT NULL,
        end_address TEXT NOT NULL,
        waypoints TEXT,
        distance REAL,
        duration REAL,
        elevation_gain REAL,
        polyline TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('資料庫初始化完成');
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    throw error;
  }
}

/**
 * 使用者相關操作
 */
export const User = {
  // 建立新使用者
  async create(username, email, hashedPassword) {
    const result = await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return { id: result.lastID, username, email };
  },

  // 根據使用者名稱查找使用者
  async findByUsername(username) {
    return await dbGet('SELECT * FROM users WHERE username = ?', [username]);
  },

  // 根據電子郵件查找使用者
  async findByEmail(email) {
    return await dbGet('SELECT * FROM users WHERE email = ?', [email]);
  },

  // 根據ID查找使用者
  async findById(id) {
    return await dbGet('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
  }
};

/**
 * 路線相關操作
 */
export const Route = {
  // 建立新路線
  async create(routeData) {
    const { userId, name, startLat, startLng, startAddress, endLat, endLng, endAddress, waypoints, distance, duration, elevationGain, polyline } = routeData;
    
    const waypointsJson = waypoints ? JSON.stringify(waypoints) : null;
    
    const result = await dbRun(
      `INSERT INTO routes (user_id, name, start_lat, start_lng, start_address, end_lat, end_lng, end_address, waypoints, distance, duration, elevation_gain, polyline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, startLat, startLng, startAddress, endLat, endLng, endAddress, waypointsJson, distance, duration, elevationGain, polyline]
    );
    
    return { id: result.lastID };
  },

  // 取得使用者的所有路線
  async findByUserId(userId) {
    const routes = await dbAll('SELECT * FROM routes WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    // 解析 waypoints JSON
    return routes.map(route => ({
      ...route,
      waypoints: route.waypoints ? JSON.parse(route.waypoints) : null
    }));
  },

  // 根據ID查找路線
  async findById(id) {
    const route = await dbGet('SELECT * FROM routes WHERE id = ?', [id]);
    if (route) {
      route.waypoints = route.waypoints ? JSON.parse(route.waypoints) : null;
    }
    return route;
  },

  // 刪除路線
  async delete(id, userId) {
    // 確保使用者只能刪除自己的路線
    return await dbRun('DELETE FROM routes WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

export default db;

