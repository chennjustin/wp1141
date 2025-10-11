import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Calendar, Clock, MapPin, Check } from 'lucide-react'
import { Movie, Screening, Hall } from '@/context/MovieContext'

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  movie: Movie | null
  screening: Screening | null
  hall: Hall | null
  seats: string[]
}

export default function AddToCartModal({
  isOpen,
  onClose,
  movie,
  screening,
  hall,
  seats,
}: AddToCartModalProps) {
  const navigate = useNavigate()

  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 防止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!movie || !screening || !hall) return null

  const totalPrice = parseFloat(screening.price_TWD) * seats.length

  const handleGoToCart = () => {
    onClose()
    setTimeout(() => {
      navigate('/cart')
    }, 200)
  }

  const handleContinueShopping = () => {
    onClose()
  }

  // 點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.2 }}
           className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
           onClick={handleBackdropClick}
         >
           <motion.div
             initial={{ scale: 0.9, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             exit={{ scale: 0.9, opacity: 0, y: 20 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="relative max-w-lg w-full z-[10000]"
             onClick={(e) => e.stopPropagation()}
           >
             {/* 電影票券樣式容器 */}
             <div 
               className="relative bg-white border-2 border-gray-300 overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
               }}
             >
               {/* 票券撕邊效果 */}
               <div className="relative">
                 <div 
                   className="absolute -top-2 left-0 right-0 h-4"
                   style={{
                     background: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 Q10,0 20,10 Q30,20 40,10 Q50,0 60,10 Q70,20 80,10 Q90,0 100,10 L100,20 L0,20 Z' fill='white'/%3E%3C/svg%") repeat-x`,
                     backgroundSize: '20px 20px'
                   }}
                 />
                 
                 {/* 內容區域 */}
                 <div className="relative z-10 p-4">
                   {/* 關閉按鈕 */}
                   <button
                     onClick={onClose}
                     className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-20"
                     aria-label="關閉"
                   >
                     <X className="h-5 w-5 text-gray-500" />
                   </button>

                   {/* 票券頭部 - 成功提示 */}
                   <div className="text-center pt-3 pb-4 border-b-2 border-dashed border-gray-300 mb-4">
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                       className="inline-flex items-center justify-center w-7 h-7 bg-green-500 rounded-full mb-2 shadow-lg"
                     >
                       <Check className="h-3.5 w-3.5 text-white" />
                     </motion.div>
                     <h2 className="text-sm font-bold text-gray-900 mb-1">
                       已加入購物車
                     </h2>
                     <p className="text-xs text-gray-600">
                       您的訂票資訊已成功加入購物車
                     </p>
                   </div>

                   {/* 電影資訊區塊 */}
                   <div className="space-y-3 mb-4">
                     {/* 電影名稱 */}
                     <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{movie.title}</h3>
                      <p className="text-xs text-gray-500 italic">{movie.eng_title}</p>
                     </div>

                     {/* 電影資訊 Grid */}
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">日期</p>
                         <div className="flex items-center gap-1.5 text-xs text-gray-700">
                           <Calendar className="h-3 w-3 text-gray-400" />
                           <span>
                             {new Date(screening.date).toLocaleDateString('zh-TW', {
                               month: 'short',
                               day: 'numeric',
                               weekday: 'short',
                             })}
                           </span>
                         </div>
                       </div>

                       <div>
                         <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">時間</p>
                         <div className="flex items-center gap-1.5 text-xs text-gray-700">
                           <Clock className="h-3 w-3 text-gray-400" />
                           <span>{screening.start_time}</span>
                         </div>
                       </div>

                       <div>
                         <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">影廳</p>
                         <div className="flex items-center gap-1.5 text-xs text-gray-700">
                           <MapPin className="h-3 w-3 text-gray-400" />
                           <span>{hall.hall_name}</span>
                         </div>
                       </div>

                       <div>
                         <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">票種</p>
                         <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                           {screening.format}
                         </span>
                       </div>
                     </div>

                   {/* 座位 */}
                   <div>
                     <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">座位</p>
                     <div className="flex flex-wrap gap-1.5">
                       {seats.map((seat) => (
                         <span
                           key={seat}
                           className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-md shadow-sm border border-blue-600"
                         >
                           {seat}
                         </span>
                       ))}
                     </div>
                   </div>
                   </div>

                   {/* 虛線分隔 */}
                   <div className="border-b-2 border-dashed border-gray-300"></div>

                   {/* 金額區塊 */}
                   <div className="py-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border border-yellow-200">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-xs text-gray-600 font-medium">
                           {seats.length} 張票 × NT$ {screening.price_TWD}
                         </p>
                         <p className="text-xs text-gray-500 mt-1">單價</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xl font-bold text-yellow-600">
                           NT$ {totalPrice.toLocaleString()}
                         </p>
                         <p className="text-xs text-gray-600 mt-1">總金額</p>
                       </div>
                     </div>
                   </div>

                   {/* 虛線分隔 */}
                   <div className="border-b-2 border-dashed border-gray-300"></div>

                   {/* 行動按鈕 */}
                   <div className="flex gap-3 pt-4">
                     <button
                       onClick={handleContinueShopping}
                       className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-200"
                     >
                       繼續選購
                     </button>
                     <button
                       onClick={handleGoToCart}
                       className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-lg shadow-md"
                     >
                       <ShoppingCart className="inline mr-2 h-4 w-4" />
                       前往購物車
                     </button>
                   </div>
                 </div>
               </div>
             </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     )
   }

