import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const usePlaylistStore = create((set) => ({
  playlists: [],
  currentPlaylist: null,
  loading: false,

  fetchPlaylists: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/playlists');
      set({ playlists: response.data.playlists, loading: false });
    } catch (error) {
      set({ loading: false });
      console.log(error.message)
    }
  },

  fetchPlaylistById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/playlists/${id}`);
      set({ currentPlaylist: response.data.playlist, loading: false });
    } catch (error) {
      set({ loading: false });
       toast.error(error.response?.data?.message || "Failed to get playlist");
    }
  },

  createPlaylist: async (playlistData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/playlists', playlistData);
      set((state) => ({
        playlists: [...state.playlists, response.data],
        loading: false,
      }));

      toast.success('Playlist created');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create playlist");
    }
  },

  addTrackToPlaylist: async (id, trackId) => {
    try {
      const response = await api.post(`/playlists/${id}/tracks`, { trackId });
      set((state) => ({
        playlists: state.playlists.map((p) =>
          p._id === id ? response.data.playlist : p
        ),
      }));
        toast.success('Track added');
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to add track to playlist");
    }
  },

  removeTrackFromPlaylist: async (id, trackId) => {
    try {
      const response = await api.delete(`/playlists/${id}/tracks/${trackId}`);
      set((state) => ({
        playlists: state.playlists.map((p) =>
          p._id === id ? response.data.playlist : p 
        ),
      }));
      toast.success('Track removed');
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to remove track from playlist");
    }
  },

  deletePlaylist: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/playlists/${id}`);
      set((state) => ({
        playlists: state.playlists.filter((p) => p._id !== id),
        loading: false,
      }));
      toast.success('Playlist deleted');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete playlist");
    }
  },
}));