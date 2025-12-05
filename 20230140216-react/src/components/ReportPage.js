import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Tambahkan CSS Animasi di dalam komponen (Inline Style Hack)
const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-fade { animation: fadeIn 0.3s ease-out forwards; }
  .animate-zoom { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  // State menyimpan OBJECT lengkap, bukan cuma URL, biar bisa tampilkan nama di popup
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      const response = await axios.get('http://localhost:3001/api/reports/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setReports(response.data);
        setFilteredReports(response.data);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data laporan.");
    }
  };

  useEffect(() => { fetchReports(); }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(item => 
        item.user && item.user.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  };

  const formatDate = (dateString) => {
      if(!dateString) return '-';
      return new Date(dateString).toLocaleString('id-ID', { 
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) + ' WIB';
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 relative">
      <style>{animationStyles}</style>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📄</span> Laporan Presensi
        </h1>
        <form onSubmit={handleSearch} className="flex space-x-2 w-full md:w-auto">
          <input
            type="text" placeholder="Cari nama..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 w-full text-sm"
          />
          <button type="submit" className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition shadow-md">
            Cari
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-4 border border-red-200">{error}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mahasiswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Masuk</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pulang</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bukti Foto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((item, idx) => (
              <tr key={idx} className="hover:bg-indigo-50 transition duration-150">
                <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{item.user ? item.user.nama : "Unknown"}</p>
                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">{formatDate(item.checkIn)}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-medium">{formatDate(item.checkOut)}</td>
                <td className="px-6 py-4">
                    {item.buktiFoto ? (
                        <button 
                            onClick={() => setSelectedRecord(item)}
                            className="group flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition shadow-sm"
                        >
                            <img 
                                src={`http://localhost:3001/uploads/${item.buktiFoto}`} 
                                alt="thumb" 
                                className="w-6 h-6 rounded-full object-cover group-hover:scale-110 transition"
                            />
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-600">Lihat</span>
                        </button>
                    ) : (
                        <span className="text-xs text-gray-400 italic">No Data</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- POPUP (MODAL) GANTENG --- */}
      {selectedRecord && (
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade p-4"
            onClick={() => setSelectedRecord(null)}
          >
              {/* Card Container */}
              <div 
                className="bg-white/10 border border-white/20 p-2 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] flex flex-col relative animate-zoom"
                onClick={(e) => e.stopPropagation()}
              >
                  
                  {/* Tombol Close Floating */}
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="absolute -top-4 -right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg hover:bg-gray-200 hover:scale-110 transition z-50"
                  >
                      ✕
                  </button>

                  {/* Header Info (Overlay di atas foto) */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg z-10 border border-white/10">
                      <p className="text-sm font-bold">{selectedRecord.user?.nama}</p>
                      <p className="text-xs text-gray-300">{formatDate(selectedRecord.checkIn)}</p>
                  </div>

                  {/* Gambar Utama */}
                  <img 
                    src={`http://localhost:3001/uploads/${selectedRecord.buktiFoto}`} 
                    alt="Bukti Full" 
                    className="rounded-xl max-h-[75vh] object-contain bg-black shadow-inner"
                  />

                  {/* Footer Actions */}
                  <div className="mt-4 flex justify-between items-center px-2">
                      <div className="text-white text-xs opacity-70">
                          Lokasi: {selectedRecord.latitude}, {selectedRecord.longitude}
                      </div>
                      <a 
                        href={`http://localhost:3001/uploads/${selectedRecord.buktiFoto}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition shadow-lg flex items-center gap-2"
                      >
                          <span>⬇️</span> Download / Buka Asli
                      </a>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

export default ReportPage;