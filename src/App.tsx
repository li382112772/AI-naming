import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WelcomePage } from '@/pages/WelcomePage';
import { ChatPage } from '@/pages/ChatPage';
import { NameListPage } from '@/pages/NameListPage';
import { NameDetailView } from '@/pages/NameDetailView';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { FlowDebugger } from '@/components/debug/FlowDebugger';
import { PageTransition } from '@/components/layout/PageTransition';
import { AnimatePresence } from 'framer-motion';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><WelcomePage /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
        <Route path="/names" element={<PageTransition><NameListPage /></PageTransition>} />
        <Route path="/names/:id" element={<PageTransition><NameDetailView /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
        <Route path="/sessions" element={<PageTransition><SessionsPage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* Fixed Debugger for Dev */}
      <div className="fixed bottom-4 right-4 z-50 w-80 shadow-2xl hidden md:block opacity-50 hover:opacity-100 transition-opacity">
        <FlowDebugger />
      </div>

      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
