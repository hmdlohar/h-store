import { create } from "zustand";

const initialState = {
  order: null,
  step: 1,
  product: null,
};

export const useOrderStore = create((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setOrder: (order) => set({ order }),
  setStep: (step) => set({ step }),
  setProduct: (product) => set({ product }),
  resetOrder: () => {
    set({ order: null, step: 1, product: null });
  },
}));
