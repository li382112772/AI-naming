import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NameDetail } from '@/types';
import { favoriteService } from '@/services/db';

interface FavoritesState {
  favorites: NameDetail[];
  isLoading: boolean;
  
  loadFavorites: () => Promise<void>;
  addFavorite: (name: NameDetail) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,

      loadFavorites: async () => {
        set({ isLoading: true });
        try {
          const favorites = await favoriteService.getAll();
          set({ favorites });
        } catch (error) {
          console.error('Failed to load favorites:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addFavorite: async (name: NameDetail) => {
        try {
          // Optimistic update
          set(state => ({ favorites: [...state.favorites, name] }));
          await favoriteService.add(name);
        } catch (error) {
          console.error('Failed to add favorite:', error);
          // Revert on error
          set(state => ({ favorites: state.favorites.filter(n => n.id !== name.id) }));
        }
      },

      removeFavorite: async (id: string) => {
        try {
          // Optimistic update
          set(state => ({ favorites: state.favorites.filter(n => n.id !== id) }));
          await favoriteService.remove(id);
        } catch (error) {
          console.error('Failed to remove favorite:', error);
          // TODO: Could revert here, but tricky without keeping the full object
        }
      },

      isFavorite: (id: string) => {
        return get().favorites.some(n => n.id === id);
      }
    }),
    {
      name: 'ai-naming-favorites',
    }
  )
);
