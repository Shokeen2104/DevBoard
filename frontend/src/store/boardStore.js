import { create } from 'zustand';
import api from '../api/axios';

const useBoardStore = create((set, get) => ({
  board: null,
  lists: [],
  isLoading: false,

  fetchBoard: async (boardId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      set({ board: data, lists: data.lists, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error(error);
    }
  },

  // Optimistic UI updates
  moveTask: async (taskId, sourceListId, destinationListId, newOrder) => {
    const originalLists = get().lists;

    // 1. Optimistic Update Local State
    set((state) => {
      const newLists = JSON.parse(JSON.stringify(state.lists)); // deep copy
      const sourceList = newLists.find(l => l._id === sourceListId);
      const destList = newLists.find(l => l._id === destinationListId);
      
      const taskIndex = sourceList.tasks.findIndex(t => t._id === taskId);
      const [task] = sourceList.tasks.splice(taskIndex, 1);
      
      task.listId = destinationListId;
      task.order = newOrder;

      // Insert and sort
      destList.tasks.push(task);
      destList.tasks.sort((a, b) => a.order - b.order);

      return { lists: newLists };
    });

    // 2. Network Request
    try {
      await api.patch(`/tasks/${taskId}`, {
        listId: destinationListId,
        order: newOrder,
        lastUpdatedAt: task.updatedAt
      });
      // the real-time socket broadcast will confirm this for other clients.
    } catch (error) {
      // 3. Rollback on failure
      set({ lists: originalLists });
      console.error('Failed to move task, rolled back.', error);
    }
  },

  // Handle incoming socket events
  handleTaskCreated: (task) => {
    set((state) => {
      const listIndex = state.lists.findIndex(l => l._id === task.listId);
      if (listIndex === -1) return state;

      const newLists = [...state.lists];
      // Avoid duplicates
      if (!newLists[listIndex].tasks.find(t => t._id === task._id)) {
        newLists[listIndex].tasks = [...newLists[listIndex].tasks, task].sort((a, b) => a.order - b.order);
      }
      return { lists: newLists };
    });
  },

  handleTaskMoved: (task) => {
    set((state) => {
      // First, remove from old list
      const newLists = state.lists.map(list => ({
        ...list,
        tasks: list.tasks.filter(t => t._id !== task._id)
      }));

      // Then, add to new list and sort
      const destIndex = newLists.findIndex(l => l._id === task.listId);
      if (destIndex !== -1) {
        newLists[destIndex].tasks.push(task);
        newLists[destIndex].tasks.sort((a, b) => a.order - b.order);
      }

      return { lists: newLists };
    });
  },

  handleTaskDeleted: (taskId) => {
    set((state) => ({
      lists: state.lists.map(list => ({
        ...list,
        tasks: list.tasks.filter(t => t._id !== taskId)
      }))
    }));
  }
}));

export default useBoardStore;
