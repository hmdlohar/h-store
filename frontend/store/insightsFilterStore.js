import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useInsightsFilterStore = create(
  persist(
    (set) => ({
      sortOption: 'createdAt-desc',
      utmSource: '',
      minViews: '',
      maxViews: '',
      setSortOption: (sortOption) => set({ sortOption }),
      setUtmSource: (utmSource) => set({ utmSource }),
      setMinViews: (minViews) => set({ minViews }),
      setMaxViews: (maxViews) => set({ maxViews }),
      resetFilters: () => set({
        sortOption: 'createdAt-desc',
        utmSource: '',
        minViews: '',
        maxViews: '',
      }),
    }),
    {
      name: "insights-filters",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
