import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUIStore = create(
    persist(
        (set, get) => ({
            // Search state
            searchQuery: '',
            searchHistory: [],

            // Filter state
            selectedFilters: [],
            priceRange: [0, 100],
            isSetFilter: null, // null means all, true means is_set=True, false means is_set=False

            // Sort state
            sortBy: 'featured', // 'featured', 'price-asc', 'price-desc', 'newest', 'name'

            // View state
            viewMode: 'grid', // 'grid' or 'list'

            // Pagination
            currentPage: 1,
            itemsPerPage: 12,

            // Search actions
            setSearchQuery: (query) => {
                set({ searchQuery: query, currentPage: 1 });

                // Add to search history if not empty
                if (query.trim()) {
                    const { searchHistory } = get();
                    const newHistory = [
                        query,
                        ...searchHistory.filter((q) => q !== query),
                    ].slice(0, 10); // Keep last 10 searches
                    set({ searchHistory: newHistory });
                }
            },

            clearSearchQuery: () => {
                set({ searchQuery: '' });
            },

            clearSearchHistory: () => {
                set({ searchHistory: [] });
            },

            // Filter actions
            setSelectedFilters: (filters) => {
                set({ selectedFilters: filters, currentPage: 1 });
            },

            toggleFilter: (filterSlug) => {
                const { selectedFilters } = get();
                const newFilters = selectedFilters.includes(filterSlug)
                    ? selectedFilters.filter((c) => c !== filterSlug)
                    : [...selectedFilters, filterSlug];
                set({ selectedFilters: newFilters, currentPage: 1 });
            },

            setPriceRange: (range) => {
                set({ priceRange: range, currentPage: 1 });
            },

            resetFilters: () => {
                set({
                    selectedFilters: [],
                    priceRange: [0, 100],
                    isSetFilter: null,
                    currentPage: 1,
                });
            },

            // isSet filter
            setIsSetFilter: (value) => {
                set({ isSetFilter: value, currentPage: 1 });
            },

            // Sort actions
            setSortBy: (sortBy) => {
                set({ sortBy, currentPage: 1 });
            },

            // View actions
            setViewMode: (mode) => {
                set({ viewMode: mode });
            },

            toggleViewMode: () => {
                const { viewMode } = get();
                set({ viewMode: viewMode === 'grid' ? 'list' : 'grid' });
            },

            // Pagination actions
            setCurrentPage: (page) => {
                set({ currentPage: page });
            },

            setItemsPerPage: (count) => {
                set({ itemsPerPage: count, currentPage: 1 });
            },

            nextPage: () => {
                set((state) => ({ currentPage: state.currentPage + 1 }));
            },

            previousPage: () => {
                set((state) => ({
                    currentPage: Math.max(1, state.currentPage - 1),
                }));
            },

            // Get active filter count
            getActiveFilterCount: () => {
                const { selectedFilters, priceRange } = get();
                let count = selectedFilters.length;
                if (priceRange[0] > 0 || priceRange[1] < 100) count++;
                return count;
            },
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => sessionStorage), // Use session storage for UI state
            partialize: (state) => ({
                viewMode: state.viewMode,
                sortBy: state.sortBy,
                searchHistory: state.searchHistory,
            }),
        }
    )
);

export default useUIStore;
