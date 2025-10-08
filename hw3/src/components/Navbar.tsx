import { Link } from 'react-router-dom'
import { Film, ShoppingCart } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useMovieContext } from '@/context/MovieContext'

export default function Navbar() {
  const { cart } = useMovieContext()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary hidden sm:inline">
              Cinema Booking System
            </span>
            <span className="text-xl font-bold text-primary sm:hidden">CBS</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/movies">
              <Button variant="ghost">電影列表</Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="flex items-center space-x-2 relative">
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

