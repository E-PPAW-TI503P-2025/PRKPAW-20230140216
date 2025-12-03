import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import Komponen Modul 10
import Navbar from './Navbar';
import AttendancePage from './AttendancePage'; 
import ReportPage from './ReportPage';         

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Tambah state loading
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            // Cek Expired
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            setUser(decoded);
        } catch (err) {
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoading(false); // Selesai loading
        }
    }, [navigate]);

    // --- TAMPILAN LOADING ---
    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Memverifikasi sesi dan memuat data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="container mx-auto p-4 md:p-8">
                
                {/* TAMPILKAN LOADING SAAT MEMVERIFIKASI TOKEN */}
                {loading || !user ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* 1. TAMPILAN ADMIN (Report) */}
                        {user.role === 'admin' && (
                            <div className="space-y-6">
                                <h1 className="text-3xl font-extrabold text-gray-900 border-b-2 pb-3 mb-6">
                                    📊 Laporan Presensi Global
                                </h1>
                                <ReportPage />
                            </div>
                        )}

                        {/* 2. TAMPILAN MAHASISWA (Attendance) */}
                        {user.role === 'mahasiswa' && (
                            // Komponen AttendancePage sudah memiliki styling card-nya sendiri
                            <AttendancePage /> 
                        )}
                    </>
                )}

            </main>
        </div>
    );
};

export default DashboardPage;