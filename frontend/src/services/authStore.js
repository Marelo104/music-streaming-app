import { create } from 'zustand';
import api from '../services/api.js';
import { toast } from 'react-hot-toast';
import { usePlayerStore } from './playerStore.js';
import { useRecentlyPlayedStore } from './recentlyPlayedStore.js';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: false,

  
  getMe: async () => {
    set({ checkingAuth: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, checkingAuth: false });

      // fetch recently played history
      const { fetchRecentlyPlayed } = useRecentlyPlayedStore.getState();
      await fetchRecentlyPlayed();

      // get the latest entry from history
      const lastEntry = useRecentlyPlayedStore.getState().history[0];
      // console.log(history)

      if (lastEntry?.track) {
        // restore the last track into playerStore
        // this makes AudioPlayer appear at the bottom
        usePlayerStore.getState().playTrack(lastEntry.track);

        // seek to last position after audio element loads
        setTimeout(() => {
          const audio = document.querySelector('audio');
          if (audio && lastEntry.lastPosition >= 0) {
            audio.currentTime = lastEntry.lastPosition;
            // pause it — don't auto play, let user press play
            audio.pause();
            usePlayerStore.getState().setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.log(error.message)
      set({ user: null, checkingAuth: false });
      usePlayerStore.getState().stopTrack(); 
    }
  },

  signup: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      set({ user: response.data.user, loading: false });  
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, loading: false });
      await useAuthStore.getState().getMe()
    } catch (error) {
      console.log(error)
      set({ loading: false });
       toast.error(error.response?.data?.message || "An error occurred");
    }
  },


  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
      usePlayerStore.getState().stopTrack();
      set({ user: null, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },
}));