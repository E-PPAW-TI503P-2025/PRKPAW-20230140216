import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Ambil data dari Backend
      const response = await axios.get('http://localhost:3001/api/reports/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setReports(response.data);
        setFilteredReports(response.data);
      }
    } catch (err) {
      setError("Gagal mengambil data laporan.");
    }
  };

  useEffect(() => { fetchReports(); }, []);

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
      return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📄 Laporan Presensi</h1>
        
        <form onSubmit={handleSearch} className="flex space-x-2 w-full md:w-auto">
          <input
            type="text" placeholder="Cari nama..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Cari</button>
        </form>
      </div>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Check-In</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Check-Out</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">Koordinat</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.user ? item.user.nama : "Unknown"}</td>
                  <td className="px-6 py-4 text-green-700 font-medium">{formatDate(item.checkIn)}</td>
                  <td className="px-6 py-4 text-red-700 font-medium">{formatDate(item.checkOut)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {item.latitude ? `${item.latitude}, ${item.longitude}` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Data tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportPage;