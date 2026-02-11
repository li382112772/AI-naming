import { describe, it, expect, beforeEach } from 'vitest';
import { addFavorite, removeFavorite, listFavorites, isFavorite } from './favorites';
import { NameDetail } from '@/types';
import { favoritesStore } from './db';

describe('Favorites Service', () => {
  const mockName: NameDetail = {
    id: 'name1',
    name: 'Test Name',
    pinyin: 'test name',
    characters: [],
    meaning: 'meaning',
    source: 'source',
    wuxing: 'gold',
    baziMatch: 'good',
    score: 90,
    uniqueness: 'high',
    uniquenessCount: '10',
    yinyun: { tone: 'good', initials: 'good', score: 90, analysis: 'good' },
    personalizedMeaning: 'good'
  };

  beforeEach(async () => {
    await favoritesStore.clear();
  });

  it('should add a favorite', async () => {
    await addFavorite(mockName);
    const favorites = await listFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0]).toEqual(mockName);
  });

  it('should check if is favorite', async () => {
    await addFavorite(mockName);
    const result = await isFavorite(mockName.id!);
    expect(result).toBe(true);
  });

  it('should remove a favorite', async () => {
    await addFavorite(mockName);
    await removeFavorite(mockName.id!);
    const result = await isFavorite(mockName.id!);
    expect(result).toBe(false);
  });

  it('should ignore favorite without id', async () => {
    await addFavorite({ ...mockName, id: undefined });
    const favorites = await listFavorites();
    expect(favorites).toHaveLength(0);
  });
});
