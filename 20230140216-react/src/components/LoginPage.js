import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { email: formData.email.trim().toLowerCase(), password: formData.password };
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert(data.message || 'Login Gagal');
            }
        } catch (error) {
            alert('Gagal koneksi ke server backend');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center">
            <div className="max-w-md w-full mx-auto px-8 py-10 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-center text-sm text-gray-500 mb-6">Silakan masuk untuk melanjutkan.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required
                    />
                    <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">Masuk</button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">Belum punya akun? <Link to="/register" className="text-indigo-600 hover:underline">Daftar</Link></p>
            </div>
        </div>
    );
};

export default LoginPage;