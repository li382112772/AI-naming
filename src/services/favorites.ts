import { NameDetail } from '@/types';
import { favoritesStore } from './db';

export async function addFavorite(nameDetail: NameDetail): Promise<void> {
  if (!nameDetail.id) return;
  await favoritesStore.setItem(nameDetail.id, nameDetail);
}

export async function removeFavorite(nameId: string): Promise<void> {
  await favoritesStore.removeItem(nameId);
}

export async function isFavorite(nameId: string): Promise<boolean> {
  const item = await favoritesStore.getItem(nameId);
  return !!item;
}

export async function listFavorites(): Promise<NameDetail[]> {
  const favorites: NameDetail[] = [];
  await favoritesStore.iterate((value: NameDetail) => {
    favorites.push(value);
  });
  return favorites;
}
