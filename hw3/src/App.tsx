import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AppModal from './components/common/AppModal'
import { ToastProvider } from './components/feedback/Toaster'
import { MovieProvider } from './context/MovieContext'
import { ModalProvider, useModal } from './context/ModalContext'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import History from './pages/History'

function AppContent() {
  const { isOpen, content, closeModal } = useModal()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<div className="container mx-auto px-4 py-8 pt-24"><Movies /></div>} />
          <Route path="/movie/:id" element={<div className="container mx-auto px-4 py-8 pt-24"><MovieDetail /></div>} />
          <Route path="/movie/:id/select-seat" element={<div className="container mx-auto px-4 py-8 pt-24"><SeatSelection /></div>} />
          <Route path="/cart" element={<div className="container mx-auto px-4 py-8 pt-24"><Cart /></div>} />
          <Route path="/checkout" element={<div className="container mx-auto px-4 py-8 pt-24"><Checkout /></div>} />
          <Route path="/history" element={<div className="container mx-auto px-4 py-8 pt-24"><History /></div>} />
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

