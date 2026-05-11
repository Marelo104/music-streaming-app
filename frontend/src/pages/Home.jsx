import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMusicStore } from '../services/musicStore.js';
import { usePodcastStore } from '../services/podcastStore.js';
import { useRecentlyPlayedStore } from '../services/recentlyPlayedStore.js';
import { usePlayerStore } from '../services/playerStore.js';
import { useLikeStore } from '../services/likeStore.js';

const Home = () => {
  const { tracks, fetchTracks, loading: tracksLoading } = useMusicStore();
  const { podcasts, fetchPodcasts } = usePodcastStore();
  const { history, fetchRecentlyPlayed } = useRecentlyPlayedStore();
  const { playTrack } = usePlayerStore();
  const { likedTracks = [], toggleLike, fetchLikedTracks } = useLikeStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTracks();
    fetchPodcasts();
    fetchRecentlyPlayed();
    fetchLikedTracks();
  }, [fetchLikedTracks, fetchPodcasts, fetchRecentlyPlayed, fetchTracks]);


  const isLiked = (trackId) => {
    if (!likedTracks || !Array.isArray(likedTracks)) return false;
    return likedTracks.some((t) => t._id === trackId);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bgColors = [
    'from-[#1a3a2a] to-[#0d1f15]',
    'from-[#2a1a3a] to-[#15102a]',
    'from-[#3a2a1a] to-[#1f180d]',
    'from-[#1a2a3a] to-[#0d1520]',
  ];

  return (
    <div className="min-h-screen pb-32 px-8 py-8">

      {/* hero */}
      <div className="bg-linear-to-br from-[#1db954]/20 to-transparent border border-white/6 rounded-2xl p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-[#1db954]/15 border border-[#1db954]/30 rounded-full px-3 py-1 text-xs text-[#1db954] font-semibold mb-5">
          <span className="w-1.5 h-1.5 bg-[#1db954] rounded-full animate-pulse" />
          Now Streaming
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-3">
          Your music,<br />
          <span className="text-[#1db954]">your world.</span>
        </h1>
        <p className="text-gray-500 text-base max-w-lg leading-relaxed mb-7">
          Millions of songs and podcasts. Stream, create playlists, and discover new music every day.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/music')}
            className="bg-[#1db954] text-black font-bold rounded-full px-7 py-3 text-sm hover:bg-[#1ed760] transition-all hover:scale-105"
          >
            ▶ Start Listening
          </button>
          <button
            onClick={() => navigate('/podcasts')}
            className="bg-white/6 border border-white/10 text-white font-semibold rounded-full px-7 py-3 text-sm hover:bg-white/10 transition-all"
          >
            Browse Podcasts
          </button>
        </div>
        <div className="flex gap-8 mt-9 pt-8 border-t border-white/6">
          {[['10M+', 'Tracks'], ['500K+', 'Podcasts'], ['50M+', 'Listeners']].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold">{num}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* recently played */}
      {history.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">Recently Played</h2>
            <Link to="/music" className="text-[#1db954] text-sm font-semibold hover:underline">See all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {history.slice(0, 5).map((item, i) => (
              <div
                key={item._id}
                onClick={() => playTrack(item.track)}
                className="flex items-center gap-4 px-4 py-3 bg-[#161616] border border-white/5 rounded-xl cursor-pointer hover:bg-[#1a1a1a] hover:border-[#1db954]/20 transition-all"
              >
                <span className="w-5 text-center text-sm text-gray-600">{i + 1}</span>
                <div className={`w-11 h-11 rounded-lg bg-linear-to-br ${bgColors[i % 4]} flex items-center justify-center text-lg shrink-0`}>
                  {item.track?.coverImage
                    ? <img src={item.track.coverImage} className="w-full h-full object-cover rounded-lg" />
                    : '🎵'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{item.track?.title}</div>
                  <div className="text-xs text-gray-500">{item.track?.artist}</div>
                </div>
                <span className="text-xs text-gray-600">{formatDuration(item.track?.duration || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* trending tracks */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Trending Tracks</h2>
          <Link to="/music" className="text-[#1db954] text-sm font-semibold hover:underline">See all</Link>
        </div>
        {tracksLoading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {tracks.slice(0, 8).map((track, i) => (
              <div
                key={track._id}
                className="bg-[#161616] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-[#1a1a1a] hover:border-[#1db954]/20 hover:-translate-y-1 transition-all group"
              >
                <div className="relative mb-4">
                  <div className={`w-full aspect-square rounded-xl bg-linear-to-br ${bgColors[i % 4]} flex items-center justify-center text-3xl overflow-hidden`}>
                    {track.coverImage
                      ? <img src={track.coverImage} className="w-full h-full object-cover" />
                      : '🎵'}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => playTrack(track)}
                      className="w-11 h-11 bg-[#1db954] rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white truncate">{track.title}</div>
                <div className="text-xs text-gray-500 mt-1">{track.artist}</div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-600">{track.plays?.toLocaleString()} plays</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(track._id); }}
                    className={`transition-colors ${isLiked(track._id) ? 'text-[#1db954]' : 'text-gray-600 hover:text-[#1db954]'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* podcasts */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Popular Podcasts</h2>
          <Link to="/podcasts" className="text-[#1db954] text-sm font-semibold hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {podcasts.slice(0, 4).map((podcast, i) => (
            <div
              key={podcast._id}
              onClick={() => navigate(`/podcasts/${podcast._id}`)}
              className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-[#1db954]/20 transition-all"
            >
              <div className={`w-full aspect-square bg-linear-to-br ${bgColors[i % 4]} flex items-center justify-center text-4xl relative`}>
                {podcast.coverImage
                  ? <img src={podcast.coverImage} className="w-full h-full object-cover" />
                  : '🎙'}
                <span className="absolute top-2 right-2 bg-[#1db954]/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {podcast.category}
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-white">{podcast.title}</div>
                <div className="text-xs text-gray-500 mt-1">by {podcast.host}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;