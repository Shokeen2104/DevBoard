import { create } from 'zustand';
import api from '../api/axios';

const useWorkspaceStore = create((set) => ({
  workspaces: [],
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/workspaces');
      set({ workspaces: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch workspaces', error);
      set({ isLoading: false });
    }
  }
}));

export default useWorkspaceStore;
