import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import History from './pages/History'
import { MovieProvider } from './context/MovieContext'
import { ModalProvider, useModal } from './context/ModalContext'
import AppModal from './components/common/AppModal'
import { ToastProvider } from './components/feedback/Toaster'

function AppContent() {
  const { isOpen, content, closeModal } = useModal()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/movie/:id/select-seat" element={<SeatSelection />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      {/* 全域 Modal */}
      <AppModal isOpen={isOpen} onClose={closeModal}>
        {content}
      </AppModal>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ModalProvider>
          <MovieProvider>
            <AppContent />
          </MovieProvider>
        </ModalProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App

