import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Cart from './pages/Cart'
import { MovieProvider } from './context/MovieContext'

function App() {
  return (
    <BrowserRouter>
      <MovieProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
        </div>
      </MovieProvider>
    </BrowserRouter>
  )
}

export default App

