import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/Home.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import MusicPage from "./pages/Music.jsx";
import PodcastsPage from "./pages/Podcasts.jsx";
import PlaylistPage from "./pages/Playlist.jsx";
import AdminPage from "./pages/AdminUpload.jsx";

import Navbar from "./components/Navbar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import AudioPlayer from './components/Player/AudioPlayer.jsx';

import { useAuthStore } from "./services/authStore.js";

const App = () => {
  const { user, getMe, checkingAuth } = useAuthStore();

  useEffect(() => {
    getMe();
  }, [getMe]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(29,185,84,0.15)_0%,rgba(0,40,20,0.1)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        {/* only show navbar when logged in */}
        {user && <Navbar />} 

        <Routes>
          {/* public routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />

          {/* all protected routes */}
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/music" element={user ? <MusicPage /> : <Navigate to="/login" />} />
          <Route path="/podcasts" element={user ? <PodcastsPage /> : <Navigate to="/login" />} />
          <Route path="/playlists" element={user ? <PlaylistPage /> : <Navigate to="/login" />} />

          {/* admin only */}
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <AudioPlayer />
      </div>

      <Toaster />
    </div>
  );
};

export default App;