import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try { setUser(jwtDecode(token)); } catch (e) {}
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={()=>navigate('/dashboard')}>
                    <span>PresensiApp</span><span className="text-2xl">🎓</span>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-100">{user.nama}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase text-slate-900 ${user.role === 'admin' ? 'bg-yellow-400' : 'bg-blue-300'}`}>{user.role}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition">Logout</button>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;