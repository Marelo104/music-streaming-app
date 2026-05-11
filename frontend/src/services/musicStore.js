import { create } from 'zustand';
import api from '../services/api.js';

export const useMusicStore = create((set) => ({
  tracks: [],
  currentTrack: null,
  categories: [],
  loading: false,
  error: null,

  fetchTracks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/tracks');
      set({ tracks: response.data.tracks, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/tracks/categories');
      set({ categories: response.data.categories, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  fetchTrackById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/tracks/${id}`);
      set({ currentTrack: response.data.track, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  incrementPlays: async (id) => {
    try {
      await api.patch(`/tracks/${id}/plays`);
      // update plays count in the tracks array without refetching
      set((state) => ({
        tracks: state.tracks.map((track) =>
          track._id === id ? { ...track, plays: track.plays + 1 } : track
        ),
      }));
    } catch (error) {
      set({ error: error.response?.data?.message });
    }
  },
}));