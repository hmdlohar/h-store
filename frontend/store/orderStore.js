import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  order: null,
  step: 1,
  product: null,
};

export const useOrderStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),
      setOrder: (order) => set({ order }),
      setStep: (step) => set({ step }),
      setProduct: (product) => set({ product }),
      resetOrder: () => {
        set({ order: null, step: 1, product: null });
      },
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
