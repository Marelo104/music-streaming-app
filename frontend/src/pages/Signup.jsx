import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../services/authStore.js';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signup, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    signup(username, email, password);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 w-full max-w-md">

        {/* logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-[#1db954] rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-xl">
            Sound<span className="text-[#1db954]">Wave</span>
          </span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Start listening for free today</p>

        {/* error */}
        {/* {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )} */}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cooluser123"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-[#1db954] focus:bg-[#1db954]/5 transition-all"
            />
          </div>

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
              placeholder="Min. 6 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-[#1db954] focus:bg-[#1db954]/5 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] text-black font-bold rounded-full py-4 mt-6 hover:bg-[#1ed760] transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[#4a4a4a] text-xs mt-4">
          By signing up, you agree to our{' '}
          <span className="text-[#1db954]">Terms</span> and{' '}
          <span className="text-[#1db954]">Privacy Policy</span>
        </p>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-gray-600 text-xs">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <p className="text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:text-[#1db954] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;