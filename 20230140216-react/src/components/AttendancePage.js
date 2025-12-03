import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Webcam from 'react-webcam';
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
  const [coords, setCoords] = useState(null);
  const [image, setImage] = useState(null);
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // 1. Ambil Lokasi (Geolocation API)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError("Gagal ambil lokasi: " + err.message)
      );
    }
  }, []);

  // 2. Ambil Foto (Capture)
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  }, [webcamRef]);

  // 3. Kirim Data (Check-In)
  const handleCheckIn = async () => {
    if (!coords || !image) return setError("Wajib ambil foto selfie dulu!");
    
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
        const blob = await (await fetch(image)).blob();
        const formData = new FormData();
        formData.append('latitude', coords.lat);
        formData.append('longitude', coords.lng);
        formData.append('image', blob, 'selfie.jpg');

        await axios.post("http://localhost:3001/api/presensi/check-in", formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setMessage("Check-in berhasil!");
    } catch (err) {
        setError("Gagal Check-In: " + (err.response?.data?.message || err.message));
    }
  };

  // 4. Check-Out
  const handleCheckOut = async () => {
      if (!coords) return setError("Tunggu lokasi...");
      const token = localStorage.getItem("token");
      try {
          await axios.post("http://localhost:3001/api/presensi/check-out", 
            { latitude: coords.lat, longitude: coords.lng }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessage("Check-out berhasil!");
      } catch(err) { setError("Gagal Checkout"); }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Selfie Presensi</h2>

      {message && <div className="bg-green-100 text-green-800 p-3 mb-3 text-center font-bold">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 p-3 mb-3 text-center rounded font-bold border border-red-200">{error}</div>}

      {/* AREA KAMERA */}
      <div className="mb-4 bg-black h-64 rounded-lg overflow-hidden flex justify-center items-center relative border-2 border-gray-300">
          {image ? (
              <img src={image} alt="Selfie" className="h-full w-full object-cover" />
          ) : (
              <Webcam
                  audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                  className="h-full w-full object-cover" videoConstraints={{ facingMode: "user" }}
              />
          )}
      </div>

      {/* TOMBOL KAMERA */}
      <div className="mb-6 flex gap-2">
          {!image ? (
              <button onClick={capture} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">📸 Ambil Foto</button>
          ) : (
              <button onClick={() => setImage(null)} className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition">🔄 Foto Ulang</button>
          )}
      </div>

      {/* AREA PETA */}
      <div className="h-64 border rounded-lg mb-6 relative z-0 overflow-hidden bg-gray-100">
          {coords ? (
             <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                <Marker position={[coords.lat, coords.lng]}><Popup>Posisi Anda</Popup></Marker>
             </MapContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
                 <p className="text-2xl">🌍</p>
                 <p>Mencari Lokasi...</p>
             </div>
          )}
      </div>

      {/* TOMBOL AKSI */}
      <div className="flex gap-3">
          <button onClick={handleCheckIn} disabled={!coords || !image} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300">MASUK (Check-In)</button>
          <button onClick={handleCheckOut} disabled={!coords} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300">PULANG (Check-Out)</button>
      </div>
    </div>
  );
}

export default AttendancePage;