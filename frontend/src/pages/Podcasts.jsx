import { useEffect, useState } from 'react';
import { usePodcastStore } from '../services/podcastStore.js';
import { usePlayerStore } from '../services/playerStore.js';
import { useAuthStore } from '../services/authStore.js';
// import { parseBlob } from 'music-metadata-browser';
import toast from 'react-hot-toast';

const bgColors = [
  'from-[#1a3a2a] to-[#0d1f15]',
  'from-[#2a1a3a] to-[#15102a]',
  'from-[#3a2a1a] to-[#1f180d]',
  'from-[#1a2a3a] to-[#0d1520]',
  'from-[#3a1a1a] to-[#200d0d]',
];

const CATEGORIES = ['all', 'tech', 'business', 'comedy', 'health', 'education', 'other'];

const Podcasts = () => {
  const {
    podcasts, currentPodcast, episodes,
    fetchPodcasts, fetchPodcastById,
    createPodcast, addEpisode,
    deletePodcast, deleteEpisode,
    loading,
  } = usePodcastStore();

  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // which modal is open
  const [showCreatePodcast, setShowCreatePodcast] = useState(false);
  const [showAddEpisode, setShowAddEpisode] = useState(false);

  // create podcast form
  const [podTitle, setPodTitle] = useState('');
  const [podHost, setPodHost] = useState('');
  const [podDesc, setPodDesc] = useState('');
  const [podCategory, setPodCategory] = useState('other');
  const [podCover, setPodCover] = useState(null);

  // add episode form
  const [epTitle, setEpTitle] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epNumber, setEpNumber] = useState('');
  const [epAudio, setEpAudio] = useState(null);
  const [epDuration, setEpDuration] = useState('');

  const isOwner = currentPodcast?.uploadedBy?._id === user?._id ||
                currentPodcast?.uploadedBy === user?._id;

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const handleSelectPodcast = (id) => {
    fetchPodcastById(id);
    setTimeout(() => {
      document.getElementById('podcast-detail')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handlePlayEpisode = (episode) => {
    playTrack({
      _id: episode._id,
      title: episode.title,
      artist: currentPodcast?.host || 'Unknown',
      audioUrl: episode.audioUrl,
      coverImage: currentPodcast?.coverImage || '',
      duration: episode.duration,
      episodeNumber: episode.episodeNumber
    });
  };

  // read duration from episode audio file automatically
  const handleEpAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEpAudio(file);

    // create a temporary audio element to read duration
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;

    audio.addEventListener('loadedmetadata', () => {
      const seconds = Math.floor(audio.duration);
      setEpDuration(seconds.toString());
      URL.revokeObjectURL(url); // clean up memory
    });
  };

  const handleCreatePodcast = async (e) => {
    e.preventDefault();
    if (!podTitle || !podHost) {
      toast.error('Title and host are required');
      return;
    }
    const formData = new FormData();
    formData.append('title', podTitle);
    formData.append('host', podHost);
    formData.append('description', podDesc);
    formData.append('category', podCategory);
    if (podCover) formData.append('cover', podCover);

    await createPodcast(formData);
    toast.success('Podcast created');
    setPodTitle(''); setPodHost(''); setPodDesc('');
    setPodCover(null);
    setShowCreatePodcast(false);
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    if (!currentPodcast) {
      toast.error('Select a podcast first');
      return;
    }
    if (!epTitle || !epNumber || !epAudio) {
      toast.error('Title, episode number and audio are required');
      return;
    }
    const formData = new FormData();
    formData.append('title', epTitle);
    formData.append('description', epDesc);
    formData.append('episodeNumber', epNumber);
    formData.append('duration', epDuration);
    formData.append('audio', epAudio);

    await addEpisode(currentPodcast._id, formData);
    toast.success('Episode added');
    setEpTitle(''); setEpDesc(''); setEpNumber('');
    setEpAudio(null); setEpDuration('');
    setShowAddEpisode(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredPodcasts = podcasts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.host.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-32 px-8 py-8">

      {/* header row */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-4xl font-bold mb-1">Podcasts</h1>
          <p className="text-gray-500 text-sm">Discover and create shows</p>
        </div>
        {/* any logged in user can create a podcast */}
        <button
          onClick={() => setShowCreatePodcast(true)}
          className="flex items-center gap-2 bg-[#1db954] text-black font-bold rounded-full px-5 py-2.5 text-sm hover:bg-[#1ed760] transition-all hover:scale-105"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          New Podcast
        </button>
      </div>

      {/* search + categories */}
      <div className="flex items-center gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-5 py-2.5 flex-1 max-w-sm focus-within:border-[#1db954] transition-all">
          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search podcasts..."
            className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-600 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize
                ${activeCategory === cat
                  ? 'bg-[#1db954]/15 border border-[#1db954]/40 text-[#1db954]'
                  : 'bg-white/5 border border-white/8 text-gray-400 hover:text-white'
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

      {/* empty */}
      {!loading && filteredPodcasts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎙</div>
          <p className="text-gray-500 text-sm">No podcasts found</p>
        </div>
      )}

      {/* podcasts grid */}
      {!loading && filteredPodcasts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10">
          {filteredPodcasts.map((podcast, i) => (
        
            <div
              key={podcast._id}
              onClick={() => handleSelectPodcast(podcast._id)}
              className={`bg-[#161616] relative group border rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all
                ${currentPodcast?._id === podcast._id
                  ? 'border-[#1db954]/40'
                  : 'border-white/5 hover:border-[#1db954]/25'
                }`}
            >
              {/* delete button — top right corner, shows on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();  // don't trigger handleSelectPodcast
                  deletePodcast(podcast._id);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-full items-center justify-center hidden group-hover:flex transition-all hover:bg-red-500 z-10"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>

              {/* rest of card stays the same */}

              <div className={`w-full aspect-square bg-gradient-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center text-4xl relative`}>
                {podcast.coverImage
                  ? <img src={podcast.coverImage} className="w-full h-full object-cover" />
                  : '🎙'}
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {podcast.category}
                </span>
              </div>
              
              <div className="p-4">
                <div className="text-sm font-semibold text-white mb-1">{podcast.title}</div>
                <div className="text-xs text-gray-500 mb-3">by {podcast.host}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-600">{podcast.episodeCount || 0} episodes</span>
                  <button className="bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] text-xs font-semibold px-3 py-1 rounded-full hover:bg-[#1db954] hover:text-black transition-all">
                    Listen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* episode detail panel */}
      {currentPodcast && (
        <div id="podcast-detail" className="bg-[#161616] border border-white/6 rounded-2xl p-7">

          {/* podcast header */}
          <div className="flex gap-5 mb-8 items-start justify-between">
            <div className="flex gap-5 items-start">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${bgColors[0]} flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden`}>
                {currentPodcast.coverImage
                  ? <img src={currentPodcast.coverImage} className="w-full h-full object-cover" />
                  : '🎙'}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{currentPodcast.title}</h2>
        
                <p className="text-gray-500 text-sm mb-1 flex items-center gap-2 flex-wrap">
                  by {currentPodcast.host} · {currentPodcast.category}
                  {isOwner && (
                    <span className="bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] text-xs font-semibold px-2 py-0.5 rounded-full">
                      Your podcast
                    </span>
                  )}
                </p>
                {currentPodcast.description && (
                  <p className="text-gray-600 text-sm leading-relaxed max-w-lg">{currentPodcast.description}</p>
                )}
              </div>
            </div>

          {/* only show Add Episode if user owns this podcast */}
          {isOwner && (
            <button
              onClick={() => setShowAddEpisode(true)}
              className="flex items-center gap-2 bg-white/6 border border-white/10 text-white rounded-full px-4 py-2 text-sm hover:border-[#1db954] hover:text-[#1db954] transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add Episode
            </button>
          )}
          </div>

          {/* episodes list */}
          <h3 className="text-base font-bold mb-4">
            Episodes {episodes.length > 0 && `(${episodes.length})`}
          </h3>

          {episodes.length === 0 && (
            <p className="text-gray-600 text-sm">No episodes yet — add the first one</p>
          )}

          <div className="flex flex-col gap-2">
            {episodes.map((episode) => (
              <div
                key={episode._id}
                className="flex items-center gap-4 px-4 py-3.5 bg-white/3 border border-white/5 rounded-xl hover:bg-[#1db954]/5 hover:border-[#1db954]/20 transition-all group"
              >

                
                <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  {episode.episodeNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white mb-0.5">{episode.title}</div>
                  {episode.description && (
                    <div className="text-xs text-gray-600 truncate max-w-md">{episode.description}</div>
                  )}
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {formatDuration(episode.duration)}
                </span>

                {/* delete episode button */}
                <button
                  onClick={() => {
                    deleteEpisode(currentPodcast._id, episode._id);
                  }}
                  className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePlayEpisode(episode)}
                  className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                >
                  {currentTrack?._id === episode._id && isPlaying
                    ? <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    : <svg className="w-3 h-3 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE PODCAST MODAL ── */}
      {showCreatePodcast && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreatePodcast(false); }}
        >
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">Create Podcast</h2>
            <form onSubmit={handleCreatePodcast}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                  <input
                    value={podTitle}
                    onChange={(e) => setPodTitle(e.target.value)}
                    placeholder="Podcast title"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Host</label>
                  <input
                    value={podHost}
                    onChange={(e) => setPodHost(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={podCategory}
                  onChange={(e) => setPodCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#1db954] transition-all"
                >
                  {['tech', 'business', 'comedy', 'health', 'education', 'other'].map((c) => (
                    <option key={c} value={c} className="bg-[#161616]">{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={podDesc}
                  onChange={(e) => setPodDesc(e.target.value)}
                  placeholder="What is this podcast about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Cover Image</label>
                <div
                  onClick={() => document.getElementById('pod-cover').click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${podCover ? 'border-[#1db954] bg-[#1db954]/5' : 'border-white/10 hover:border-[#1db954]'}`}
                >
                  <p className={`text-sm ${podCover ? 'text-[#1db954]' : 'text-gray-500'}`}>
                    {podCover ? podCover.name : 'Click to select cover image'}
                  </p>
                </div>
                <input type="file" id="pod-cover" accept="image/*" onChange={(e) => setPodCover(e.target.files[0])} className="hidden" />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePodcast(false)}
                  className="flex-1 bg-white/6 border border-white/10 text-white rounded-full py-3 text-sm hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1db954] text-black font-bold rounded-full py-3 text-sm disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD EPISODE MODAL ── */}
      {showAddEpisode && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddEpisode(false); }}
        >
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1">Add Episode</h2>
            <p className="text-gray-500 text-sm mb-5">
              Adding to: <span className="text-white font-semibold">{currentPodcast?.title}</span>
            </p>
            <form onSubmit={handleAddEpisode}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                  <input
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    placeholder="Episode title"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Episode #</label>
                  <input
                    type="number"
                    value={epNumber}
                    onChange={(e) => setEpNumber(e.target.value)}
                    placeholder="1"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={epDesc}
                  onChange={(e) => setEpDesc(e.target.value)}
                  placeholder="What is this episode about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#1db954] transition-all resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Audio File</label>
                <div
                  onClick={() => document.getElementById('ep-audio-file').click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${epAudio ? 'border-[#1db954] bg-[#1db954]/5' : 'border-white/10 hover:border-[#1db954]'}`}
                >
                  <p className={`text-sm ${epAudio ? 'text-[#1db954]' : 'text-gray-500'}`}>
                    {epAudio ? epAudio.name : 'Click to select audio file'}
                  </p>
                  {epDuration && (
                    <span className="text-xs text-gray-600">
                      Duration: {Math.floor(Number(epDuration) / 60)}:{String(Number(epDuration) % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  id="ep-audio-file"
                  accept=".mp3,.wav,.ogg"
                  onChange={handleEpAudioChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEpisode(false)}
                  className="flex-1 bg-white/6 border border-white/10 text-white rounded-full py-3 text-sm hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1db954] text-black font-bold rounded-full py-3 text-sm disabled:opacity-60"
                >
                  {loading ? 'Adding...' : 'Add Episode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Podcasts;