import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';
// import { useRecentlyPlayedStore } from "./recentlyPlayedStore.js"

export const useAdminStore = create((set) => ({
  users: [],
  searchResults: [],
  loading: false,
  error: null,

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data.users, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  toggleUserRole: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/admin/users/${userId}/role`);
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? response.data.user : user
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  uploadTrack: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/admin/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ loading: false });
      toast.success(response.data.message)
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create track");
    }
  },

  deleteTrack: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/tracks/${id}`);
      // await useRecentlyPlayedStore.getState().deleteRecentlyPlayed(id)
   
      set({ loading: false });
      toast.success('Track deleted');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete track");
    }
  },

  // searches TheAudioDB through your backend
  // searchFromAudioDB: async (query) => {
  //   set({ loading: true, error: null });
  //   try {
  //     const response = await api.get(`/admin/search?q=${query}`);
  //     set({ searchResults: response.data.tracks, loading: false });
  //   } catch (error) {
  //     set({ error: error.response?.data?.message, loading: false });
  //   }
  // },
}));