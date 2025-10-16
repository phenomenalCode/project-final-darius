import { create } from "zustand";
import axios from "axios";

const API_BASE = "https://project-final-darius-1.onrender.com";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // JWT stored in localStorage
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useGroupStore = create((set, get) => ({
  groups: [],

  fetchGroups: async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/groups`, {
        headers: getAuthHeaders(),
        withCredentials: true, // keep this if your backend also sets cookies
      });
         
      set({ groups: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error("Failed to fetch groups:", err.response?.data || err);
      set({ groups: [] });
      throw err;
    }
  },

  createGroup: async (name) => {
    if (!name?.trim()) return;
    try {
      const { data } = await axios.post(
        `${API_BASE}/groups`,
        { name: name.trim() },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      set((state) => ({ groups: [...state.groups, data || { name, members: [] }] }));
    } catch (err) {
    
      throw err;
    }
  },

  joinGroup: async (id) => {
    try {
      await axios.put(`${API_BASE}/groups/${id}/join`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      await get().fetchGroups();
    } catch (err) {
     
      throw err;
    }
  },

  leaveGroup: async (id) => {
    try {
      await axios.put(`${API_BASE}/groups/${id}/leave`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      await get().fetchGroups();
    } catch (err) {
     
      throw err;
    }
  },

  deleteGroup: async (id) => {
    try {
      await axios.delete(`${API_BASE}/groups/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      set((state) => ({ groups: state.groups.filter((g) => g._id !== id) }));
    } catch (err) {
      console.error("Failed to delete group:", err.response?.data || err);
      throw err;
    }
  },

  setProject: async (id, projectName) => {
    try {
      await axios.put(`${API_BASE}/groups/${id}/project`, { projectName }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      await get().fetchGroups();
    } catch (err) {
      
      throw err;
    }
  },setGroupProject: async (groupId, projectName) => {
  try {
    await axios.put(`${API_BASE}/groups/${groupId}/project`, { projectName }, { withCredentials: true });
    set((state) => ({
      groups: state.groups.map((g) =>
        g._id === groupId ? { ...g, currentProject: projectName } : g
      ),
    }));
  } catch (err) {
  
    throw err;
  }
},

removeProject: async (id) => {
  try {
    await axios.delete(`${API_BASE}/groups/${id}/project`, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    await get().fetchGroups();
  } catch (err) {
  
    throw err;
  }
},
}));
