/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 確保靜態資源正確服務（開發模式下）
  // 如果使用 ngrok 或其他代理，可能需要設置 assetPrefix
  // assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
}

module.exports = nextConfig

