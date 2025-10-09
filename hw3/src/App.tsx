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
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<div className="container mx-auto px-4 py-8"><Movies /></div>} />
          <Route path="/movie/:id" element={<div className="container mx-auto px-4 py-8"><MovieDetail /></div>} />
          <Route path="/movie/:id/select-seat" element={<div className="container mx-auto px-4 py-8"><SeatSelection /></div>} />
          <Route path="/cart" element={<div className="container mx-auto px-4 py-8"><Cart /></div>} />
          <Route path="/checkout" element={<div className="container mx-auto px-4 py-8"><Checkout /></div>} />
          <Route path="/history" element={<div className="container mx-auto px-4 py-8"><History /></div>} />
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

