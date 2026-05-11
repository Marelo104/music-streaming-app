import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore.js';
import { useState } from 'react';


const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/music?search=${search}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/6 px-8 h-17.5 flex items-center justify-between">

      {/* logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8.5 h-8.5 bg-[#1db954] rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-sm">S</span>
        </div>
        <span className="font-bold text-lg" style={{ fontFamily: 'sans-serif' }}>
          Sound<span className="text-[#1db954]">Wave</span>
        </span>
      </Link>

      {/* nav links */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isActive('/') ? 'text-[#1db954] bg-[#1db954]/10' : 'text-gray-400 hover:text-white hover:bg-white/6'}`}
        >
          Home
        </Link>
        <Link
          to="/music"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isActive('/music') ? 'text-[#1db954] bg-[#1db954]/10' : 'text-gray-400 hover:text-white hover:bg-white/6'}`}
        >
          Music
        </Link>
        <Link
          to="/podcasts"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isActive('/podcasts') ? 'text-[#1db954] bg-[#1db954]/10' : 'text-gray-400 hover:text-white hover:bg-white/6'}`}
        >
          Podcasts
        </Link>
        <Link
          to="/playlists"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${isActive('/playlists') ? 'text-[#1db954] bg-[#1db954]/10' : 'text-gray-400 hover:text-white hover:bg-white/6'}`}
        >
          Playlists
        </Link>

        {/* admin link — only shows if user is admin */}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive('/admin') ? 'text-[#1db954] bg-[#1db954]/10' : 'text-gray-400 hover:text-white hover:bg-white/6'}`}
          >
            Admin
          </Link>
        )}
      </div>

      {/* right side */}
      <div className="flex items-center gap-3">

        {/* search */}
        <div className="flex items-center gap-2 bg-white/6 border border-white/8 rounded-full px-4 py-2 w-50 focus-within:border-[#1db954] focus-within:bg-[#1db954]/5 transition-all">
          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search..."
            className="bg-none bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 w-full"
          />
        </div>

        {/* admin badge */}
        {user?.role === 'admin' && (
          <span className="bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] px-3 py-1 rounded-full text-xs font-semibold">
            Admin
          </span>
        )}

        {/* avatar */}
        <div className="w-8.5 h-8.5 bg-linear-to-br from-[#1db954] to-[#158a3e] rounded-full flex items-center justify-center font-bold text-sm text-black cursor-pointer">
          {user?.username?.charAt(0).toUpperCase()}
        </div>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="border border-white/10 text-gray-400 px-4 py-1.5 rounded-full text-sm hover:border-red-500 hover:text-red-400 transition-all"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;