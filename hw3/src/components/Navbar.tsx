import { Link } from 'react-router-dom'
import { Film, ShoppingCart } from 'lucide-react'
import { Button } from './ui/button'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Cinema Booking System</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/movies">
              <Button variant="ghost">電影列表</Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>購物車</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

