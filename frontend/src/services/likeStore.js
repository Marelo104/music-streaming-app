import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useLikeStore = create((set) => ({
  likedTracks: [],
  loading: false,

  fetchLikedTracks: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/likes');
      set({ likedTracks: response.data.likedTracks, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get likeTrack");
      set({ loading: false });
    }
  },

  toggleLike: async (trackId) => {
    try {
      const response = await api.post(`/likes/${trackId}`);
       set({ likedTracks: response.data.likedTracks });
      toast.success(response.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle track");
    }
  },
}));