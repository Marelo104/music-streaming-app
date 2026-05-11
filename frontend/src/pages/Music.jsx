import { useEffect, useState } from 'react';
import { useMusicStore } from '../services/musicStore.js';
import { usePlayerStore } from '../services/playerStore.js';
import { useLikeStore } from '../services/likeStore.js';
import { useAdminStore } from '../services/adminStore.js';
import { useAuthStore } from '../services/authStore.js';

const bgColors = [
  'from-[#1a3a2a] to-[#0d1f15]',
  'from-[#2a1a3a] to-[#15102a]',
  'from-[#3a2a1a] to-[#1f180d]',
  'from-[#1a2a3a] to-[#0d1520]',
  'from-[#3a1a1a] to-[#200d0d]',
];

const Music = () => {
  const { tracks, categories, fetchTracks, fetchCategories, loading } = useMusicStore();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { likedTracks = [], toggleLike, fetchLikedTracks } = useLikeStore();

  const { deleteTrack } = useAdminStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchTracks();
    fetchCategories();
    fetchLikedTracks();
  }, [fetchCategories, fetchLikedTracks, fetchTracks]);

  const isLiked = (id) => {
    if (!likedTracks || !Array.isArray(likedTracks)) return false;
    return likedTracks.some((t) => t._id === id);
  };

  const isCurrentTrack = (id) => currentTrack?._id === id;

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || track.genre === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-32 px-8 py-8">

      <h1 className="text-4xl font-bold mb-1">Music</h1>
      <p className="text-gray-500 text-sm mb-7">Stream your favourite tracks</p>

      {/* search + categories */}
      <div className="flex items-center gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-5 py-2.5 flex-1 max-w-sm focus-within:border-[#1db954] focus-within:bg-[#1db954]/5 transition-all">
          <svg className="w-4 h-4 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks, artists..."
            className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 w-full"
          />
        </div>

        {/* category pills */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize
                ${activeCategory === cat
                  ? 'bg-[#1db954]/15 border border-[#1db954]/40 text-[#1db954]'
                  : 'bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:border-white/20'
                }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* empty state */}
      {!loading && filteredTracks.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎵</div>
          <p className="text-gray-500 text-sm">No tracks found</p>
        </div>
      )}

      {/* tracks grid */}
      {!loading && filteredTracks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTracks.map((track, i) => (
            <div
              key={track._id}
              className="bg-[#161616] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-[#1c1c1c] hover:border-[#1db954]/25 hover:-translate-y-1 transition-all group relative"
            >
              {/* now playing badge */}
              {isCurrentTrack(track._id) && isPlaying && (
                <div className="absolute top-3 right-3 bg-[#1db954]/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                  Playing
                </div>
              )}

              {/* cover */}
              <div className="relative mb-3">
                <div className={`w-full aspect-square rounded-xl bg-linear-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center text-3xl overflow-hidden`}>
                  {track.coverImage
                    ? <img src={track.coverImage} className="w-full h-full object-cover" />
                    : '🎵'}
                </div>
                <div className="absolute inset-0 bg-black/45 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => playTrack(track)}
                    className="w-11 h-11 bg-[#1db954] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {isCurrentTrack(track._id) && isPlaying
                      ? <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                      : <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="text-sm font-semibold text-white truncate">{track.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{track.artist}</div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-[11px] text-gray-600">
                  {formatDuration(track.duration)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(track._id); }}
                  className={`transition-colors ${isLiked(track._id) ? 'text-[#1db954]' : 'text-gray-600 hover:text-[#1db954]'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            {user?.role === 'admin' && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteTrack(track._id);
                    // remove from local state
                    fetchTracks();
                  }}
                  className="absolute top-2 left-2 w-7 h-7 bg-red-500/80 rounded-full items-center justify-center hidden group-hover:flex transition-all hover:bg-red-500"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Music;