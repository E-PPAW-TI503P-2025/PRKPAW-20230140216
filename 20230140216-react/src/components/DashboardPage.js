import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';
import ReportPage from './ReportPage'; // Halaman Khusus Admin

// --- Fix Icon Marker Leaflet ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // State Koordinat (Default null, menunggu GPS)
    const [coords, setCoords] = useState(null);
    
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // 1. Cek Token & Role
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            try {
                const decoded = jwtDecode(token);
                // Cek Expired
                if (decoded.exp < Date.now() / 1000) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                setUser(decoded);

                // === MODUL POIN 1: GEOLOCATION API ===
                // Jika Mahasiswa, nyalakan GPS Browser
                if (decoded.role === 'mahasiswa') {
                    getGeolocation();
                }

            } catch (err) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [navigate]);

    // 2. Fungsi Ambil Lokasi Asli (Sesuai Modul)
    const getGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Sukses ambil lokasi asli
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setError("");
                },
                (err) => {
                    // Jika user tolak akses / error, kasih notif
                    setError("Gagal mendapatkan lokasi. Mohon izinkan akses GPS browser Anda.");
                    console.error(err);
                }
            );
        } else {
            setError("Browser tidak mendukung Geolocation.");
        }
    };

    // 3. Fungsi Kirim Data ke Backend
    const handlePresensi = async (type) => {
        if (!coords) return setError("Lokasi belum ditemukan. Tunggu peta muncul.");
        setMessage(""); setError("");
        
        const token = localStorage.getItem('token');
        const endpoint = type === 'in' ? '/check-in' : '/check-out';
        
        try {
            // Mengirim latitude & longitude sesuai Modul Poin 3 (Struktur Database)
            const res = await axios.post(`http://localhost:3001/api/presensi${endpoint}`, 
                { latitude: coords.lat, longitude: coords.lng },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan pada server.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="container mx-auto p-6">
                
                {/* === TAMPILAN ADMIN (Load ReportPage) === */}
                {user && user.role === 'admin' && (
                    <ReportPage />
                )}

                {/* === TAMPILAN MAHASISWA (Peta & Tombol) === */}
                {user && user.role === 'mahasiswa' && (
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">📍 Presensi Mahasiswa</h2>
                        
                        <p className="text-center text-sm mb-4 text-gray-500">
                            {coords ? "Lokasi Anda terdeteksi ✅" : "Sedang mencari titik GPS... ⏳"}
                        </p>

                        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center font-bold">{message}</div>}
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

                        {/* PETA OSM (Sesuai Modul Poin 2) */}
                        <div className="rounded-lg overflow-hidden border border-gray-300 mb-6 relative z-0" style={{ height: '350px' }}>
                            {coords ? (
                                <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                                    <Marker position={[coords.lat, coords.lng]}>
                                        <Popup>Posisi Presensi Anda</Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="h-full bg-gray-100 flex items-center justify-center animate-pulse text-gray-500 flex-col gap-2">
                                    <span className="text-2xl">🌍</span>
                                    <span>Mohon Izinkan Akses Lokasi (Allow)...</span>
                                </div>
                            )}
                        </div>

                        {/* TOMBOL AKSI */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handlePresensi('in')} 
                                disabled={!coords} 
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-lg shadow-md transition transform active:scale-95 ${coords ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                MASUK (Check-In)
                            </button>
                            <button 
                                onClick={() => handlePresensi('out')} 
                                disabled={!coords} 
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-lg shadow-md transition transform active:scale-95 ${coords ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                PULANG (Check-Out)
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default DashboardPage;