import { create } from 'zustand';
import api from '../api/axios';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/workspaces');
      
      const currentActive = get().activeWorkspaceId;
      let newActive = currentActive;
      if (data.length > 0 && (!currentActive || !data.find(w => w._id === currentActive))) {
        newActive = data[0]._id;
      }
      
      set({ workspaces: data, activeWorkspaceId: newActive, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch workspaces', error);
      set({ isLoading: false });
    }
  }
}));

export default useWorkspaceStore;
