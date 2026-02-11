import localforage from 'localforage';
import { BabySession, BabyInfo, NameDetail, Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const sessionsStore = localforage.createInstance({
  name: 'ai-naming',
  storeName: 'sessions'
});

export const favoritesStore = localforage.createInstance({
  name: 'ai-naming',
  storeName: 'favorites'
});

export const ordersStore = localforage.createInstance({
  name: 'ai-naming',
  storeName: 'orders'
});

// Helper to simulate delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sessionService = {
  async getAll(): Promise<BabySession[]> {
    const sessions: BabySession[] = [];
    await sessionsStore.iterate((value: BabySession) => {
      sessions.push(value);
    });
    return sessions;
  },

  async getById(id: string): Promise<BabySession | null> {
    return await sessionsStore.getItem<BabySession>(id);
  },

  async create(info: BabyInfo): Promise<BabySession> {
    const id = uuidv4();
    const newSession: BabySession = {
      id,
      babyInfo: info,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unlockedSeries: []
    };
    await sessionsStore.setItem(id, newSession);
    return newSession;
  },

  async update(id: string, updates: Partial<BabySession>): Promise<BabySession> {
    const session = await this.getById(id);
    if (!session) throw new Error('Session not found');
    
    const updatedSession = { ...session, ...updates, updatedAt: Date.now() };
    await sessionsStore.setItem(id, updatedSession);
    return updatedSession;
  },

  async delete(id: string): Promise<void> {
    await sessionsStore.removeItem(id);
  }
};

export const favoriteService = {
  async getAll(): Promise<NameDetail[]> {
    const favorites: NameDetail[] = [];
    await favoritesStore.iterate((value: NameDetail) => {
      favorites.push(value);
    });
    return favorites;
  },

  async add(name: NameDetail): Promise<void> {
    if (!name.id) name.id = uuidv4();
    await favoritesStore.setItem(name.id, name);
  },

  async remove(id: string): Promise<void> {
    await favoritesStore.removeItem(id);
  },

  async isFavorite(id: string): Promise<boolean> {
    const item = await favoritesStore.getItem(id);
    return !!item;
  }
};

export const orderService = {
  async create(order: Order): Promise<void> {
    await ordersStore.setItem(order.id, order);
  },

  async getBySessionId(sessionId: string): Promise<Order[]> {
    const orders: Order[] = [];
    await ordersStore.iterate((value: Order) => {
      if (value.sessionId === sessionId) {
        orders.push(value);
      }
    });
    return orders;
  }
};

