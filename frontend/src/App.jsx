import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import LegalPage from './pages/LegalPage';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  const token = localStorage.getItem('token');
  if (!isAuthenticated || !token) return <Navigate to="/" replace />;
  return children;
};

function Layout({ role, setRole, zone, setZone }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isLegalPage = location.pathname === '/legal';

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <Toaster position="top-right" />
      
      {/* Dynamic Header Ribbon - hide on login/legal pages to prevent clutter */}
      {!isLoginPage && !isLegalPage && (
        <header className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-3xl z-50 border-b border-white/20 h-1 hidden">
            {/* Keeping this for future top-bar extension */}
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${(isLoginPage || isLegalPage) ? '' : 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-4'}`}>
        <Routes>
          <Route path="/" element={<LoginPage setRole={setRole} setZone={setZone} role={role} zone={zone} />} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={Boolean(role)}><Dashboard role={role} zone={zone} setRole={setRole} setZone={setZone} /></ProtectedRoute>} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<Navigate to={role ? '/dashboard' : '/'} replace />} />
        </Routes>
      </main>

      {/* Modernised Footer for Command Node */}
      <footer className={`mt-auto ${isLoginPage || isLegalPage ? 'bg-ashoka text-white/40' : 'bg-transparent text-slate-400'} py-6 transition-colors duration-500`}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-ashoka/20 flex items-center justify-center font-black text-[10px] text-ashoka border border-ashoka/10">I</div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                &copy; 2026 Tourist Management System (TMS) • National Safety Node
              </p>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link to="/legal#privacy" className="hover:text-ashoka transition-colors">Privacy Policy</Link>
            <Link to="/legal#tos" className="hover:text-ashoka transition-colors">Usage Directives</Link>
            <Link to="/legal#support" className="hover:text-ashoka transition-colors">Support Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [zone, setZone] = useState(() => localStorage.getItem('zone'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedZone = localStorage.getItem('zone');
    if (storedToken && storedRole) {
      setRole(storedRole);
      setZone(storedZone || 'North');
    }
  }, []);
  return (
    <Router>
      <Layout role={role} setRole={setRole} zone={zone} setZone={setZone} />
    </Router>
  );
}

export default App;
