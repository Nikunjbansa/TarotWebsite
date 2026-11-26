import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SanctuaryProvider } from './lib/authContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsapp } from './components/common/FloatingWhatsapp';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export function App() {
  return (
    <SanctuaryProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#FAF6F1]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminPortalPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
            <Footer />
            <FloatingWhatsapp />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </SanctuaryProvider>
  );
}

export default App;
