import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', role: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            // Decode JWT payload safely (no dependency)
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            setUser({ nama: decoded.nama || '', role: decoded.role || '' });
        } catch (err) {
            // If token invalid, redirect to login
            console.warn('Gagal decode token:', err.message);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">{user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}</div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Selamat datang, <span className="text-indigo-600">{user.nama || 'User'}</span></h1>
                            <p className="text-sm text-gray-500">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Pengguna'} — Anda berhasil login</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Logout</button>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-500">
                            <h3 className="text-indigo-500 text-sm font-medium uppercase">Status Akun</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">Aktif</p>
                            <p className="text-sm text-gray-500 mt-1">Akses aplikasi diberikan</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-400">
                            <h3 className="text-indigo-500 text-sm font-medium uppercase">Total Presensi</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">—</p>
                            <p className="text-sm text-gray-500 mt-1">Data akan muncul setelah melakukan presensi</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-300">
                            <h3 className="text-indigo-500 text-sm font-medium uppercase">Notifikasi</h3>
                            <p className="text-lg font-medium text-gray-800 mt-2">Tidak ada notifikasi baru</p>
                            <p className="text-sm text-gray-500 mt-1">Semua sistem bekerja normal</p>
                        </div>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Ringkasan</h2>
                                <span className="text-sm text-indigo-600 font-medium">Aksen Monokrom</span>
                            </div>
                            <p className="text-gray-600">Ini adalah halaman dashboard yang disesuaikan: lebih berwarna dengan aksen monokrom (nuansa indigo). Anda sudah berhasil login.</p>
                        </div>
                        <aside className="bg-white p-6 rounded-2xl shadow-md">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-center justify-between">
                                    <span>Periksa Presensi</span>
                                    <button className="text-sm text-indigo-600">Buka</button>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Unduh Laporan</span>
                                    <button className="text-sm text-indigo-600">Unduh</button>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Ubah Profil</span>
                                    <button className="text-sm text-indigo-600">Edit</button>
                                </li>
                            </ul>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;