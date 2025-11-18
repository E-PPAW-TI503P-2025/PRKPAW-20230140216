import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari local storage
    navigate('/login'); // Arahkan kembali ke halaman login
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      
      
      <div className="bg-white p-10 rounded-lg shadow-md text-center">        
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Login Sukses!
        </h1>
       
        <p className="text-lg text-gray-700 mb-8">
          Selamat Datang di Halaman Dashboard Anda.
        </p>

     
        <button
          onClick={handleLogout}
          className="py-2 px-6 bg-red-500 text-white font-semibold rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default DashboardPage;
