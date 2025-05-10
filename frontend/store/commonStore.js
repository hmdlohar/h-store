import { LocalStorageUtils } from "hyper-utils";
import { create } from "zustand";

export const useCommonStore = create((set) => ({
  user: LocalStorageUtils.lsGet("authToken") ? undefined : null,
  authToken: LocalStorageUtils.lsGet("authToken"),
  isMenuOpen: false,
  setUser: (user) => set({ user }),
  setLogin: ({ user, token }) => {
    set({ user, authToken: token });
    LocalStorageUtils.lsSet("authToken", token);
  },
  setLogout: () => {
    set({ user: null, authToken: null });
    LocalStorageUtils.lsRemove("authToken");
  },
  toggleMenu: (value) => set({ isMenuOpen: value !== undefined ? value : (state) => !state.isMenuOpen }),
}));
