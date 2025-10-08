import { useNavigate } from 'react-router-dom'
import { Film, Search, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: '立即訂票',
      description: '瀏覽最新上映電影',
      icon: Film,
      color: 'from-blue-500 to-blue-600',
      path: '/movies',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    },
    {
      title: '找電影',
      description: '搜尋您想看的電影',
      icon: Search,
      color: 'from-purple-500 to-purple-600',
      path: '/movies',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    },
    {
      title: '查看購物車',
      description: '管理您的訂票項目',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      path: '/cart',
      image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800&q=80',
    },
  ]

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow group"
              onClick={() => navigate(action.path)}
            >
              {/* 背景圖片 */}
              <div className="absolute inset-0">
                <img
                  src={action.image}
                  alt={action.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* 漸層遮罩 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-75 group-hover:opacity-85 transition-opacity`} />
              </div>

              {/* 內容 */}
              <div className="relative h-full flex flex-col items-center justify-center text-white p-6 text-center">
                {/* 圖示 */}
                <div className="mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <Icon className="h-12 w-12" />
                </div>

                {/* 標題 */}
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  {action.title}
                </h3>

                {/* 描述 */}
                <p className="text-white/90 text-sm drop-shadow">
                  {action.description}
                </p>

                {/* Hover 提示 */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm border border-white/50 px-4 py-1 rounded-full backdrop-blur-sm">
                    點擊進入 →
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default QuickActions

