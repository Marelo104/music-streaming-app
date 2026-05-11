import { useEffect } from 'react';
import { usePlaylistStore } from '../services/playlistStore.js';
import { usePlayerStore } from '../services/playerStore.js';
import toast from 'react-hot-toast';

const bgColors = [
  'from-[#1a3a2a] to-[#0d1f15]',
  'from-[#2a1a3a] to-[#15102a]',
  'from-[#3a2a1a] to-[#1f180d]',
  'from-[#1a2a3a] to-[#0d1520]',
];

const Playlist = () => {
  const {
    playlists,
    currentPlaylist,
    fetchPlaylists,
    fetchPlaylistById,
    loading,
  } = usePlaylistStore();

  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // auto select liked songs playlist on load
  useEffect(() => {
    if (playlists.length > 0) {
      const likedSongs = playlists.find((p) => p.isLikedSongs);
      if (likedSongs) fetchPlaylistById(likedSongs._id);
    }
  }, [playlists, fetchPlaylistById]);

  const handleSelectPlaylist = (id) => {
    fetchPlaylistById(id);
  };

  // play all tracks starting from the first one
  const handlePlayAll = () => {
    if (!currentPlaylist?.tracks?.length) return;
    playTrack(currentPlaylist.tracks[0]);
    toast.success(`Playing ${currentPlaylist.name}`);
    if(isPlaying){
      console.log(togglePlay())
    }
    console.log(isPlaying)
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // total playlist duration
  const totalDuration = currentPlaylist?.tracks?.reduce(
    (acc, track) => acc + (track.duration || 0), 0
  ) || 0;

  return (
    <div className="min-h-screen pb-32 px-8 py-8">

      <h1 className="text-4xl font-bold mb-1">Your Library</h1>
      <p className="text-gray-500 text-sm mb-7">Your liked songs and playlists</p>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-[260px_1fr] gap-6">

        {/* left sidebar — playlist list */}
        <div className="flex flex-col gap-2">
          {playlists.map((playlist, i) => (
            <div
              key={playlist._id}
              onClick={() => handleSelectPlaylist(playlist._id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                ${currentPlaylist?._id === playlist._id
                  ? 'bg-[#1db954]/8 border border-[#1db954]/30'
                  : 'bg-[#161616] border border-white/5 hover:bg-[#1c1c1c] hover:border-[#1db954]/20'
                }`}
            >
              {/* liked songs gets a special heart icon */}
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0
                ${playlist.isLikedSongs
                  ? 'bg-gradient-to-br from-purple-600 to-blue-400'
                  : `bg-gradient-to-br ${bgColors[i % bgColors.length]}`
                }`}
              >
                {playlist.isLikedSongs ? '💚' : '🎵'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {playlist.name}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {playlist.tracks?.length || 0} tracks
                </div>
              </div>
            </div>
          ))}

          {playlists.length === 0 && !loading && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">💚</div>
              <p className="text-gray-600 text-sm">Like a track to see it here</p>
            </div>
          )}
        </div>

        {/* right — playlist detail */}
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-7">

          {!currentPlaylist && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">💚</div>
              <p className="text-gray-500 text-sm">Select a playlist to view tracks</p>
            </div>
          )}

          {currentPlaylist && (
            <>
              {/* header */}
              <div className="flex gap-5 mb-8 items-end">
                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl flex-shrink-0
                  ${currentPlaylist.isLikedSongs
                    ? 'bg-gradient-to-br from-purple-600 to-blue-400'
                    : `bg-gradient-to-br ${bgColors[0]}`
                  }`}
                >
                  {currentPlaylist.isLikedSongs ? '💚' : '🎵'}
                </div>
                <div>
                  {/* liked songs label */}
                  {currentPlaylist.isLikedSongs && (
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      Playlist
                    </div>
                  )}
                  <h2 className="text-3xl font-bold mb-1">{currentPlaylist.name}</h2>
                  <p className="text-gray-500 text-sm">
                    {currentPlaylist.tracks?.length || 0} tracks
                    {totalDuration > 0 && ` · ${Math.floor(totalDuration / 60)} min`}
                  </p>

                  {/* play all button */}
                  {currentPlaylist.tracks?.length > 0 && (
                    <button
                      onClick={handlePlayAll}
                      className="mt-4 flex items-center gap-2 bg-[#1db954] text-black font-bold rounded-full px-6 py-2.5 text-sm hover:bg-[#1ed760] transition-all hover:scale-105"
                    >
                      <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play All
                    </button>
                  )}
                </div>
              </div>

              {/* empty state */}
              {currentPlaylist.tracks?.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">💚</div>
                  <p className="text-gray-500 text-sm">
                    {currentPlaylist.isLikedSongs
                      ? 'Like a track to add it here'
                      : 'No tracks in this playlist yet'
                    }
                  </p>
                </div>
              )}

              {/* tracks list */}
              <div className="flex flex-col gap-1">
                {currentPlaylist.tracks?.map((track, i) => (
                  <div
                    key={track._id}
                    onClick={() =>{ 
                      if(isPlaying){
                      playTrack(track)
                    }
                    togglePlay()
                  }}
                    className={`flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer transition-all group
                      ${currentTrack?._id === track._id
                        ? 'bg-[#1db954]/10'
                        : 'hover:bg-white/4'
                      }`}
                  >
                    {/* track number or playing indicator */}
                    <div className="w-5 text-center flex-shrink-0">
                      {currentTrack?._id === track._id && isPlaying
                        ? <div className="flex gap-0.5 items-end justify-center">
                            {[0, 0.15, 0.3].map((delay, j) => (
                              <div
                                key={j}
                                className="w-0.5 bg-[#1db954] rounded-sm animate-bounce"
                                style={{ height: j === 1 ? '10px' : '6px', animationDelay: `${delay}s` }}
                              />
                            ))}
                          </div>
                        : <span className="text-sm text-gray-600 group-hover:hidden">{i + 1}</span>
                      }
                      {currentTrack?._id !== track._id && (
                        <svg className="w-3.5 h-3.5 fill-white hidden group-hover:block mx-auto" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>

                    {/* cover */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center text-base flex-shrink-0 overflow-hidden`}>
                      {track.coverImage
                        ? <img src={track.coverImage} className="w-full h-full object-cover" />
                        : '🎵'}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate
                        ${currentTrack?._id === track._id ? 'text-[#1db954]' : 'text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-gray-500">{track.artist}</div>
                    </div>

                    {/* duration */}
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;