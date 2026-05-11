import { useEffect, useState } from 'react';
import { useAdminStore } from '../services/adminStore.js';
import toast from 'react-hot-toast';
// import * as mm from 'music-metadata-browser';

// genres must match your backend model enum
const GENRES = ['afrobeats', 'pop', 'hip-hop', 'r&b', 'jazz', 'classical', 'other'];

const AdminUpload = () => {
  const { users, fetchAllUsers, uploadTrack, toggleUserRole, loading } = useAdminStore();

  // tab state — 'upload' or 'users'
  const [activeTab, setActiveTab] = useState('upload');

  // TheAudioDB search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // form fields — auto filled from TheAudioDB or typed manually
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('other');
  const [duration, setDuration] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  // fetch all users when tab switches to users
  useEffect(() => {
    if (activeTab === 'users') fetchAllUsers();
  }, [activeTab, fetchAllUsers]);
  

  // search TheAudioDB directly from frontend
 const handleSearch = async () => {
  if (!searchQuery.trim()) return;
  setSearching(true);
  try {
    const res = await fetch(
      ` https://musicbrainz.org/ws/2/artist/${encodeURIComponent(searchQuery)}`
    );

    // check if response is ok before parsing
    if (!res.ok) {
      toast.error('Search failed — API error');
      return;
    }

    const text = await res.text(); // read as text first

    // if empty response, handle it gracefully
    if (!text || text.trim() === '') {
      toast.error('No results found');
      setSearchResults([]);
      return;
    }

    const data = JSON.parse(text); // then parse manually
    setSearchResults(data.track || []);

    if (!data.track) {
      toast.error('No results found');
    }
  } catch (err) {
    console.error('Search error:', err);
    toast.error('Search failed — check your connection');
  } finally {
    setSearching(false);
  }
};

  // when admin clicks a search result — auto fill the form
  const handleSelectResult = (track) => {
    setTitle(track.strTrack || '');
    setArtist(track.strArtist || '');
    setAlbum(track.strAlbum || '');
    setCoverImage(track.strTrackThumb || '');
    // match genre to your enum — default to other if not found
    const g = track.strGenre?.toLowerCase();
    setGenre(GENRES.includes(g) ? g : 'other');
    // clear results after selection
    setSearchResults([]);
    setSearchQuery('');
    toast.success('Metadata filled from TheAudioDB');
  };

  // submit the upload form
  const handleUpload = (e) => {
    e.preventDefault();

    // FormData is required for file uploads — JSON cannot send files
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);
    formData.append('genre', genre);
    formData.append('duration', duration);
    formData.append('coverImage', coverImage);
    formData.append('audio', audioFile);  // 'audio' must match multer field name

    uploadTrack(formData);

    // reset form
    setTitle('');
    setArtist('');
    setAlbum('');
    setGenre('other');
    setDuration('');
    setCoverImage('');
    setAudioFile(null);
  };
  

  return (
    <div className="min-h-screen pb-32 px-8 py-8">

      <h1 className="text-4xl font-bold mb-1">Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-7">Manage content and users</p>

      {/* tabs */}
      <div className="flex gap-1 bg-white/4 border border-white/6 rounded-xl p-1 w-fit mb-7">
        {['upload', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${activeTab === tab
                ? 'bg-[#1db954] text-black font-bold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            {tab === 'upload' ? 'Upload Track' : 'Manage Users'}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {activeTab === 'upload' && (
        <div className="bg-[#161616] border border-white/6 rounded-2xl p-8 max-w-xl">
          <h2 className="text-xl font-bold mb-1">Upload New Track</h2>
          <p className="text-gray-500 text-sm mb-6">
            Search TheAudioDB to auto-fill metadata, then upload the audio file
          </p>

          {/* TheAudioDB search */}
          <div className="flex gap-3 mb-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search artist or track name..."
              className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-[#1db954] text-black font-bold rounded-xl px-5 py-3 text-sm hover:bg-[#1ed760] transition-all disabled:opacity-60"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {/* search results dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-white/3 border border-white/6 rounded-xl mb-5 overflow-hidden">
              {searchResults.slice(0, 5).map((track, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectResult(track)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1db954]/8 border-b border-white/4 last:border-0 transition-all"
                >
                  {track.strTrackThumb && (
                    <img
                      src={track.strTrackThumb}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{track.strTrack}</div>
                    <div className="text-xs text-gray-500">{track.strArtist} · {track.strAlbum}</div>
                    <div className="text-xs text-gray-600">{track.strGenre}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* upload form */}
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Track title"
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Album</label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Album name"
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#1db954] transition-all"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g} className="bg-[#161616]">{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="214"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
              />
            </div>

            {/* audio file picker */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Audio File (MP3)</label>
              <div
                onClick={() => document.getElementById('audio-file').click()}
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all
                  ${audioFile
                    ? 'border-[#1db954] bg-[#1db954]/5'
                    : 'border-white/10 hover:border-[#1db954] hover:bg-[#1db954]/5'
                  }`}
              >
                <svg className="w-8 h-8 mx-auto mb-3 fill-gray-500" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <p className={`text-sm ${audioFile ? 'text-[#1db954]' : 'text-gray-500'}`}>
                  {audioFile ? audioFile.name : 'Click to select MP3 file'}
                </p>
                <span className="text-xs text-gray-600">Supports MP3, WAV, OGG</span>
              </div>
              <input
                type="file"
                id="audio-file"
                accept=".mp3,.wav,.ogg"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1db954] text-black font-bold rounded-full py-4 text-sm hover:bg-[#1ed760] transition-all disabled:opacity-60"
            >
              {loading ? 'Uploading...' : 'Upload Track'}
            </button>
          </form>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden max-w-2xl">
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/6">
            <h2 className="text-lg font-bold">All Users</h2>
            <span className="text-gray-500 text-sm">{users.length} users</span>
          </div>

          {users.length === 0 && (
            <div className="text-center py-10 text-gray-600 text-sm">No users found</div>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-all"
            >
              {/* avatar with first letter of username */}
              <div className="w-10 h-10 bg-gradient-to-br from-[#1db954] to-[#158a3e] rounded-full flex items-center justify-center font-bold text-black text-sm flex-shrink-0">
                {user.username?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{user.username}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>

              {/* role badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${user.role === 'admin'
                  ? 'bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954]'
                  : 'bg-white/5 border border-white/10 text-gray-500'
                }`}>
                {user.role}
              </span>

              {/* toggle role button */}
              <button
                onClick={() => toggleUserRole(user._id)}
                className="border border-white/10 text-gray-400 px-4 py-1.5 rounded-full text-xs hover:border-[#1db954] hover:text-[#1db954] transition-all"
              >
                {user.role === 'admin' ? 'Make User' : 'Make Admin'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUpload;