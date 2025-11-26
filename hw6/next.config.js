/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 確保靜態資源正確服務（開發模式下）
  // 如果使用 ngrok 或其他代理，可能需要設置 assetPrefix
  // assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  
  // 確保在開發模式下正確處理靜態資源
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 確保客戶端構建正確處理
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
}

module.exports = nextConfig

