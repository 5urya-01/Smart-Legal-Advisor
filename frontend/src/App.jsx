// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Advocates from './pages/Advocates';
import Auth from './pages/Auth';

function AppContent() {
  const navigate = useNavigate();

  // 1. Initialize User from Local Storage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sla_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Initialize Language (Default to EN)
  const [lang, setLang] = useState(() => {
    const savedUser = localStorage.getItem('sla_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser).lang || 'EN';
      } catch (e) { return 'EN'; }
    }
    return 'EN';
  });

  // 3. Sync Language state and Storage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    if (user) {
      const updatedUser = { ...user, lang: newLang };
      localStorage.setItem('sla_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // 4. THE LOGOUT: Clears session and redirects to Auth
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sla_user'); 
    navigate('/auth', { replace: true }); // Securely send back to login
  };

  return (
    <Routes>
      {/* Landing page receives 'user' so it can show "Go to Dashboard" if logged in */}
      <Route path="/" element={<Landing lang={lang} user={user} />} />
      
      <Route path="/auth" element={
        <Auth setUser={(userData) => {
          setUser(userData);
          setLang(userData.lang || 'EN');
        }} setLang={setLang} />
      } />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard lang={lang} setLang={handleSetLang} user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
      />
      <Route 
        path="/advocates" 
        element={user ? <Advocates lang={lang} setLang={handleSetLang} user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;