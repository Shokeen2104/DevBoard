import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  // Simplistic way to restore user if token exists. A real app would have a /me route.
  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Decode JWT to get basic user info or call a /me endpoint
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({ user: { id: payload.id }, isAuthenticated: true });
      } catch(e) {
        localStorage.removeItem('accessToken');
      }
    }
  }
}));

export default useAuthStore;
