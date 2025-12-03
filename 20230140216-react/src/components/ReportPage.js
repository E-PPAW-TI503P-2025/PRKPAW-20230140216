import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      // Ambil data dari Backend
      const response = await axios.get('http://localhost:3001/api/reports/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setReports(response.data);
        setFilteredReports(response.data); // Set data awal
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data laporan. Pastikan Backend Nyala.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [navigate]);

  // Logic Search (Filter di Frontend)
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
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit' 
      }) + ' WIB';
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📄</span> Laporan Presensi
        </h1>
        
        <form onSubmit={handleSearch} className="flex space-x-2 w-full md:w-auto">
          <input
            type="text" placeholder="Cari nama..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
            Cari
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Waktu Masuk</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Waktu Pulang</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Lokasi (Lat/Long)</th>
              {/* PENAMBAHAN KOLOM BUKTI FOTO */}
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Bukti Foto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.user ? item.user.nama : "Tanpa Nama"}</td>
                  <td className="px-6 py-4 text-sm text-green-700 font-medium">{formatDate(item.checkIn)}</td>
                  <td className="px-6 py-4 text-sm text-red-700 font-medium">{formatDate(item.checkOut)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                     {item.latitude ? `${item.latitude}, ${item.longitude}` : '-'}
                  </td>
                  {/* LOGIKA MENAMPILKAN LINK FOTO */}
                  <td className="px-6 py-4 text-sm">
                      {item.buktiFoto ? (
                          <a 
                              href={`http://localhost:3001/uploads/${item.buktiFoto}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                              Lihat Foto
                          </a>
                      ) : (
                          <span className="text-gray-400">Tidak Ada</span>
                      )}
                  </td>
                  {/* AKHIR PENAMBAHAN */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                  {searchTerm ? `Tidak ditemukan user dengan nama "${searchTerm}"` : "Belum ada data presensi."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportPage;