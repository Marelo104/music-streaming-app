import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { user, login, loading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    login(email, password);
    console.log(user)
    navigate('/');  // redirect to home after login
    
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 w-full max-w-md">
        
        {/* logo */}
        <div className="flex items-center gap-2 mb-9">
          <div className="w-9 h-9 bg-[#1db954] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-xl">Sound<span className="text-[#1db954]">Wave</span></span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-9">Log in to continue listening</p>

        {/* error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-[#1db954] focus:bg-[#1db954]/5 transition-all"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-[#1db954] focus:bg-[#1db954]/5 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] text-black font-bold rounded-full py-4 mt-7 hover:bg-[#1ed760] transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-gray-600 text-xs">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <p className="text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white font-semibold hover:text-[#1db954] transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;