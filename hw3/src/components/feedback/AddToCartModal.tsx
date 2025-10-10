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
           className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
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
             {/* 主體卡片 */}
             <div 
               className="relative bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden"
             >
               {/* 外框微光暈 */}
               <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-transparent to-purple-400/10"></div>
               
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

                   {/* 成功提示區塊 */}
                   <div className="text-center pt-2 pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 rounded-t-2xl -mx-3 px-3 mb-3">
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                       className="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full mb-1 shadow-lg"
                     >
                       <Check className="h-4 w-4 text-white" />
                     </motion.div>
                     <h2 className="text-base font-bold text-gray-900 mb-1">
                       已加入購物車
                     </h2>
                     <p className="text-xs text-gray-600">
                       您的訂票資訊已成功加入購物車
                     </p>
                   </div>

                   {/* 電影資訊區塊 */}
                   <div className="space-y-2">
                     {/* 電影名稱 */}
                     <div>
                       <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">電影</p>
                       <h3 className="text-base font-bold text-gray-900 mb-1">{movie.title}</h3>
                       <p className="text-xs text-gray-500 italic">{movie.title}</p>
                     </div>

                     {/* 電影資訊 Grid */}
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">日期</p>
                         <div className="flex items-center gap-2 text-xs text-gray-700">
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
                         <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">時間</p>
                         <div className="flex items-center gap-2 text-xs text-gray-700">
                           <Clock className="h-3 w-3 text-gray-400" />
                           <span>{screening.start_time}</span>
                         </div>
                       </div>

                       <div>
                         <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">影廳</p>
                         <div className="flex items-center gap-2 text-xs text-gray-700">
                           <MapPin className="h-3 w-3 text-gray-400" />
                           <span>{hall.hall_name}</span>
                         </div>
                       </div>

                       <div>
                         <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">票種</p>
                         <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                           {screening.format}
                         </span>
                       </div>
                     </div>

                     {/* 座位 */}
                     <div>
                       <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">座位</p>
                       <div className="flex flex-wrap gap-1">
                         {seats.map((seat) => (
                           <span
                             key={seat}
                             className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200 shadow-sm"
                           >
                             {seat}
                           </span>
                         ))}
                       </div>
                     </div>
                   </div>

                   {/* 金額區塊 */}
                   <div className="mt-3 p-2 bg-white border border-gray-200 rounded-xl">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-xs text-gray-600 font-medium">
                           {seats.length} 張票 × NT$ {screening.price_TWD}
                         </p>
                         <p className="text-xs text-gray-500 mt-1">單價</p>
                       </div>
                       <div className="text-right">
                         <p className="text-lg font-bold text-gray-900">
                           NT$ {totalPrice.toLocaleString()}
                         </p>
                         <p className="text-xs text-gray-600 mt-1">總金額</p>
                       </div>
                     </div>
                   </div>

                   {/* 行動按鈕 */}
                   <div className="flex flex-col gap-2 mt-3">
                     <button
                       onClick={handleContinueShopping}
                       className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-200"
                     >
                       繼續選購
                     </button>
                     <button
                       onClick={handleGoToCart}
                       className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-lg shadow-md"
                     >
                       <ShoppingCart className="inline mr-2 h-4 w-4" />
                       前往購物車
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     )
   }

