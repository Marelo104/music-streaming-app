import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../services/playerStore.js';
import { useRecentlyPlayedStore } from '../../services/recentlyPlayedStore.js';
import { useLikeStore } from '../../services/likeStore.js';
import { useMusicStore } from '../../services/musicStore.js';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    stopTrack,
    setVolume,
    setProgress,
    setDuration,
    playTrack,
  } = usePlayerStore();

  const { updateRecentlyPlayed } = useRecentlyPlayedStore();
  const { likedTracks = [], toggleLike } = useLikeStore();
  const { tracks, incrementPlays } = useMusicStore();


  const isLiked = (id) => {
    if (!likedTracks || !Array.isArray(likedTracks)) return false;
    return likedTracks.some((t) => t._id === id);
  };

  // play or pause when isPlaying changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // load new track when currentTrack changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.play();
    incrementPlays(currentTrack._id);
  }, [currentTrack, incrementPlays]);

  // sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);

      // in handleTimeUpdate
    if (Math.floor(audioRef.current.currentTime) % 5 === 0 && currentTrack) {
      // check if it's an episode or a track
      const model = currentTrack.episodeNumber ? 'Episode' : 'Track';
      updateRecentlyPlayed(currentTrack._id, Math.floor(audioRef.current.currentTime), model);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    // play next track
    const currentIndex = tracks.findIndex((t) => t._id === currentTrack._id);
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex]);
    } else if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    } else {
      stopTrack();
    }
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex((t) => t._id === currentTrack?._id);
    if (currentIndex > 0) playTrack(tracks[currentIndex - 1]);
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex((t) => t._id === currentTrack?._id);
    if (shuffle) {
      playTrack(tracks[Math.floor(Math.random() * tracks.length)]);
    } else if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    }
  };


  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // don't render if no track is playing
  if (!currentTrack) return null;

  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c]/95 backdrop-blur-3xl border-t border-white/8 px-6 h-22.5 flex items-center justify-between gap-4">

        {/* left — track info */}
        <div className="flex items-center gap-4 min-w-55 flex-1">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
            {currentTrack.coverImage
              ? <img src={currentTrack.coverImage} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-linear-to-br from-[#1a3a2a] to-[#0d1f15] flex items-center justify-center text-2xl">🎵</div>
            }
            {/* playing indicator */}
            {isPlaying && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 items-end">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-[#1db954] rounded-sm animate-bounce"
                    style={{ height: i === 1 ? '10px' : '6px', animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{currentTrack.artist}</div>
          </div>

          {/* like button */}
          <button
            onClick={() => toggleLike(currentTrack._id)}
            className={`ml-2 transition-colors ${isLiked(currentTrack._id) ? 'text-[#1db954]' : 'text-gray-600 hover:text-[#1db954]'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* center — controls + progress */}
        <div className="flex flex-col items-center gap-2.5 flex-[1.5] max-w-120">
          <div className="flex items-center gap-4">

            {/* shuffle */}
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`transition-colors ${shuffle ? 'text-[#1db954]' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* prev */}
            <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* play/pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-[#1db954] transition-all hover:scale-105"
            >
              {isPlaying
                ? <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              }
            </button>

            {/* next */}
            <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* repeat */}
            <button
              onClick={() => setRepeat(!repeat)}
              className={`transition-colors ${repeat ? 'text-[#1db954]' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>

          {/* progress bar */}
          <div className="flex items-center gap-2.5 w-full">
            <span className="text-[11px] text-gray-600 w-8 text-right">{formatTime(progress)}</span>
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#1db954] rounded-full relative group-hover:bg-[#1ed760] transition-colors"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
              </div>
            </div>
            <span className="text-[11px] text-gray-600 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* right — volume */}
        <div className="flex items-center gap-3 min-w-45 justify-end flex-1">
          <button className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
          <div
            className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pct)));
            }}
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-[#1db954] transition-colors"
              style={{ width: `${volume * 100}%` }}
              />
              {Math.floor(volume * 100) + "%"}
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;