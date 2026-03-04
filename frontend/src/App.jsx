import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

function Layout({ role, setRole, zone, setZone }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Ribbon - hide on login page */}
      {!isLoginPage && (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-white font-bold">I</div>
                  <span className="text-xl font-bold text-ashoka">TMS Command</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-sm text-ashoka font-bold uppercase">{role.replace('_', ' ')}</span>
                  <span className="text-xs text-saffron font-bold">{zone}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={!isLoginPage ? "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" : "flex-1 w-full"}>
        <Routes>
          <Route path="/" element={<LoginPage setRole={setRole} setZone={setZone} role={role} zone={zone} />} />
          <Route path="/dashboard" element={<Dashboard role={role} zone={zone} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center md:text-left">
            &copy; 2026 Tourist Management System (TMS) - Govt. of India Initiative
          </p>
          <div className="flex gap-4 text-xs font-bold text-ashoka uppercase tracking-wider">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [role, setRole] = useState('Zone_Manager');
  const [zone, setZone] = useState('North');
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout role={role} setRole={setRole} zone={zone} setZone={setZone} />
    </Router>
  );
}

export default App;
