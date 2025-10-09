import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, ShoppingCart, History, RefreshCw, HelpCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useMovieContext } from '@/context/MovieContext'
import { useModal } from '@/context/ModalContext'

export default function Navbar() {
  const { cart, reloadData, loading } = useMovieContext()
  const { openUsageGuide } = useModal()
  const [isReloading, setIsReloading] = useState(false)

  const handleReload = async () => {
    setIsReloading(true)
    await reloadData()
    setIsReloading(false)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/70 to-transparent text-white backdrop-blur-md shadow-md transition-all duration-500">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Film className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white hidden sm:inline">
              Cinema Booking System
            </span>
            <span className="text-xl font-bold text-white sm:hidden">CBS</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReload}
              disabled={loading || isReloading}
              title="重新載入資料"
              className="hidden sm:flex text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openUsageGuide}
              title="使用教學"
              className="text-white hover:bg-white/20"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Link to="/movies">
              <Button variant="ghost" className="text-white hover:bg-white/20">電影列表</Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" className="hidden sm:flex items-center space-x-2 text-white hover:bg-white/20">
                <History className="h-4 w-4" />
                <span>歷史訂單</span>
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden text-white hover:bg-white/20">
                <History className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="flex items-center space-x-2 relative border-white/30 text-white hover:bg-white/20 bg-transparent hover:bg-white/10">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">購物車</span>
                {cart.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

