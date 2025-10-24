function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">關於 TravelSpot Journal</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            TravelSpot Journal 是一個基於 React + TypeScript + Vite 開發的旅遊景點記錄應用程式。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">主要功能</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>整合 Google Maps JavaScript API</li>
            <li>在地圖上點擊新增景點標記</li>
            <li>右側顯示景點列表</li>
            <li>點擊列表項目聚焦地圖位置</li>
            <li>標記資訊視窗顯示詳細資訊</li>
            <li>使用 TailwindCSS 提供現代化 UI</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">技術棧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">前端框架</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Vite</li>
                <li>• React Router DOM</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">地圖服務</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Maps JavaScript API</li>
                <li>• @react-google-maps/api</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">樣式框架</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• TailwindCSS</li>
                <li>• PostCSS</li>
                <li>• Autoprefixer</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">其他工具</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Axios (HTTP 客戶端)</li>
                <li>• ESLint</li>
                <li>• Prettier</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">使用說明</h2>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>在地圖上點擊任意位置新增景點標記</li>
            <li>右側列表會顯示所有已新增的景點</li>
            <li>點擊列表中的景點項目，地圖會自動聚焦到該位置</li>
            <li>點擊地圖上的標記可查看詳細資訊</li>
            <li>在資訊視窗中可以刪除景點</li>
          </ol>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800">
              <strong>注意：</strong> 請確保在 .env 檔案中設定正確的 Google Maps API Key。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
