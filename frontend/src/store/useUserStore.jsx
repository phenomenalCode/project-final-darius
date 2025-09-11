import { create } from "zustand";
import axios from "axios";


const API_BASE = "https://project-final-darius-1.onrender.com";

export const useUserStore = create((set, get) => ({
  user: null,   // { id, username, group }
  token: null,

  // --- Set user and persist token ---
  setUser: (user, token) => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    set({ user, token });
  },

  // --- Clear user and token ---
  clearUser: () => {
    const { setUser } = get(); // get other actions
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = "";
    setUser(null, null); // call the setUser action properly
  },

  // --- Load user from localStorage ---
  loadUserFromStorage: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await axios.get(`${API_BASE}/auth/me`);
      set({ user: data.user, token });
    } catch (err) {
      console.error("Failed to load user from storage:", err);
      const { setUser } = get();
      setUser(null, null); // call properly
    }
  },
}));
