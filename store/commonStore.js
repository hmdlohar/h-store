import { create } from "zustand";

export const useCommonStore = create((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));
