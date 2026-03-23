import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUIStore = create(
    persist(
        (set, get) => ({
            // Search state
            searchQuery: '',
            searchHistory: [],

            // Filter state
            selectedCategories: [],
            selectedSubcategories: [],
            priceRange: [0, 1000],

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
            setSelectedCategories: (categories) => {
                set({ selectedCategories: categories, currentPage: 1 });
            },

            toggleCategory: (category) => {
                const { selectedCategories } = get();
                const newCategories = selectedCategories.includes(category)
                    ? selectedCategories.filter((c) => c !== category)
                    : [...selectedCategories, category];
                set({ selectedCategories: newCategories, currentPage: 1 });
            },

            setSelectedSubcategories: (subcategories) => {
                set({ selectedSubcategories: subcategories, currentPage: 1 });
            },

            toggleSubcategory: (subcategory) => {
                const { selectedSubcategories } = get();
                const newSubcategories = selectedSubcategories.includes(subcategory)
                    ? selectedSubcategories.filter((s) => s !== subcategory)
                    : [...selectedSubcategories, subcategory];
                set({ selectedSubcategories: newSubcategories, currentPage: 1 });
            },

            // Hierarchical toggle for categories (toggles children too)
            toggleCategoryHierarchical: (categorySlug, childSlugs = [], checked) => {
                const { selectedCategories, selectedSubcategories } = get();
                let newCats = [...selectedCategories];
                let newSubs = [...selectedSubcategories];

                if (checked) {
                    if (!newCats.includes(categorySlug)) newCats.push(categorySlug);
                    childSlugs.forEach(slug => {
                        if (!newSubs.includes(slug)) newSubs.push(slug);
                    });
                } else {
                    newCats = newCats.filter(c => c !== categorySlug);
                    newSubs = newSubs.filter(s => !childSlugs.includes(s));
                }

                set({
                    selectedCategories: newCats,
                    selectedSubcategories: newSubs,
                    currentPage: 1
                });
            },

            // Hierarchical toggle for subcategories
            toggleSubcategoryHierarchical: (subcategorySlug, checked) => {
                const { selectedSubcategories } = get();
                let newSubs = [...selectedSubcategories];

                if (checked) {
                    if (!newSubs.includes(subcategorySlug)) newSubs.push(subcategorySlug);
                } else {
                    newSubs = newSubs.filter(s => s !== subcategorySlug);
                }

                set({ selectedSubcategories: newSubs, currentPage: 1 });
            },

            setPriceRange: (range) => {
                set({ priceRange: range, currentPage: 1 });
            },

            resetFilters: () => {
                set({
                    selectedCategories: [],
                    selectedSubcategories: [],
                    priceRange: [0, 1000],
                    currentPage: 1,
                });
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
                const { selectedCategories, selectedSubcategories, priceRange } = get();
                let count = selectedCategories.length + selectedSubcategories.length;
                if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
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
