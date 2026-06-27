import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Memories from './pages/Memories';
import Timeline from './pages/Timeline';
import Relationships from './pages/Relationships';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import MemoryDetail from './pages/MemoryDetail';
import Search from './pages/Search';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Lenis from 'lenis';
import './styles/index.css';

function App() {
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Dashboard Area */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Layout><Upload /></Layout></ProtectedRoute>} />
            <Route path="/memories" element={<ProtectedRoute><Layout><Memories /></Layout></ProtectedRoute>} />
            <Route path="/memories/:id" element={<ProtectedRoute><Layout><MemoryDetail /></Layout></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><Layout><Timeline /></Layout></ProtectedRoute>} />
            <Route path="/relationships" element={<ProtectedRoute><Layout><Relationships /></Layout></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Layout><Search /></Layout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
