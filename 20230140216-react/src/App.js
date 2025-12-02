import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Halaman Utama
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Jika buka root website, langsung lempar ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 2. Halaman Autentikasi */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 3. Halaman Utama (Dashboard Pintar) */}
        {/* Halaman ini akan otomatis mendeteksi role (Admin/Mahasiswa) */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 4. Fallback: Jika user mengetik URL aneh, kembalikan ke Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;