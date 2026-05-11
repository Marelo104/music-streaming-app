import { create } from 'zustand';
import api from './api.js';
import toast from 'react-hot-toast';

export const useRecentlyPlayedStore = create((set) => ({
  history: [],
  loading: false,

  fetchRecentlyPlayed: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/recently-played');
      // filter out any entries where track was deleted (track is null)
      const validHistory = response.data.history.filter((item) => item.track !== null);

      set({ history: validHistory, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  // when playing a track
  updateRecentlyPlayed: async (trackId, lastPosition, trackModel = 'Track') => {
    try {
      await api.post('/recently-played', { trackId, lastPosition, trackModel });
    } catch (error) {
      set({ error: error.response?.data?.message });
    }
  },

  getLastPosition: async (trackId) => {
    try {
      const response = await api.get(`/recently-played/${trackId}`);
      return response.data.lastPosition;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get position")
      return 0; // default to start if never played
    }
  },
}));