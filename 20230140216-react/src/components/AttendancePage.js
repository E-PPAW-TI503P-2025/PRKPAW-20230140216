import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Icon Marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function AttendancePage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // KOORDINAT DEFAULT: YOGYAKARTA (Tugu/Malioboro area)
  // Tidak menggunakan GPS Browser agar lebih mudah testing
  const [coords] = useState({ lat: -7.7956, lng: 110.3695 });

  const handleAction = async (type) => {
    setMessage(""); setError("");
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const endpoint = type === 'in' ? '/check-in' : '/check-out';

    try {
      const res = await axios.post(`http://localhost:3001/api/presensi${endpoint}`, 
        { latitude: coords.lat, longitude: coords.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memproses data.";
      setError(msg);
      
      // Auto Logout jika token expired/rusak
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setTimeout(() => { localStorage.removeItem('token'); navigate('/login'); }, 1500);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">📍 Presensi Mahasiswa</h2>
      <p className="text-center text-gray-400 text-sm mb-4">Lokasi diset otomatis: Yogyakarta</p>

      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center font-bold">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

      <div className="rounded-lg overflow-hidden border border-gray-300 mb-6 relative z-0" style={{ height: '350px' }}>
        <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>Lokasi Presensi Anda</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => handleAction('in')} 
          className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition transform active:scale-95"
        >
          MASUK (Check-In)
        </button>
        <button 
          onClick={() => handleAction('out')} 
          className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition transform active:scale-95"
        >
          PULANG (Check-Out)
        </button>
      </div>
    </div>
  );
}

export default AttendancePage;