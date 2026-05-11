import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const usePodcastStore = create((set) => ({
  podcasts: [],
  currentPodcast: null,
  episodes: [],
  loading: false,

  createPodcast: async (formData) => {
    set({ loading: true });
    try {
      const response = await api.post('/podcasts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({
        podcasts: [...state.podcasts, response.data.podcast],
        loading: false,
      }));
      console.log(response.data.podcast)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create podcast");
      set({ loading: false });
    }
  },

  addEpisode: async (podcastId, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/podcasts/${podcastId}/episodes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({
        episodes: [...state.episodes, response.data.episode],
        podcasts: state.podcasts.map((p) =>
        p._id === podcastId
          ? { ...p, episodeCount: (p.episodeCount || 0) + 1 }
          : p
        ),
        loading: false,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add episode");
      set({ loading: false });
    }
  },

  fetchPodcasts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/podcasts');
      set({ podcasts: response.data.podcasts, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get podcasts");
      set({ loading: false });
    }
  },

  fetchPodcastById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/podcasts/${id}`);
      set({
        currentPodcast: response.data.podcast, 
        episodes: response.data.episodes,        
        loading: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get podcast");
      set({ loading: false });
    }
  },

  deletePodcast: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/podcasts/${id}`);
      set((state) => ({
        podcasts: state.podcasts.filter((p) => p._id !== id),
        loading: false,
      }));
      toast.success('Podcast deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete podcast");
      set({ loading: false });
    }
  },

  incrementEpisodePlays: async (id, episodeId) => {
    try {
      await api.patch(`/podcasts/${id}/episodes/${episodeId}/plays`);
      set((state) => ({
        episodes: state.episodes.map((episode) =>
          episode._id === episodeId 
            ? { ...episode, plays: episode.plays + 1 }
            : episode
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to increment play");
    }
  },

  deleteEpisode: async (podcastId, episodeId) => {
  try {
    await api.delete(`/podcasts/${podcastId}/episodes/${episodeId}`);
    set((state) => ({
      episodes: state.episodes.filter((ep) => ep._id !== episodeId),
      podcasts: state.podcasts.map((p) =>
        p._id === podcastId
          ? { ...p, episodeCount: Math.max(0, (p.episodeCount || 0) - 1) }
          : p
      ),
    }));
    toast.success('Episode deleted');
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete episode");
  }
},
}));