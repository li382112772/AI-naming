import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BabySession, BabyInfo } from '@/types';
import { sessionService } from '@/services/db';

interface SessionState {
  currentSessionId: string | null;
  sessions: BabySession[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (info: BabyInfo) => Promise<string>;
  setCurrentSession: (id: string | null) => void;
  updateSession: (id: string, updates: Partial<BabySession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useSessions = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSessionId: null,
      sessions: [],
      isLoading: false,
      error: null,

      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await sessionService.getAll();
          set({ sessions: sessions.sort((a, b) => b.updatedAt - a.updatedAt) });
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      createSession: async (info: BabyInfo) => {
        set({ isLoading: true, error: null });
        try {
          const newSession = await sessionService.create(info);
          set(state => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: newSession.id
          }));
          return newSession.id;
        } catch (err) {
          set({ error: (err as Error).message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentSession: (id: string | null) => {
        set({ currentSessionId: id });
      },

      updateSession: async (id: string, updates: Partial<BabySession>) => {
        try {
          // Optimistic update
          set(state => ({
            sessions: state.sessions.map(s => 
              s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
            )
          }));
          
          await sessionService.update(id, updates);
        } catch (err) {
          set({ error: (err as Error).message });
          // Revert on error would be ideal here, but skipping for MVP complexity
        }
      },

      deleteSession: async (id: string) => {
        try {
          await sessionService.delete(id);
          set(state => ({
            sessions: state.sessions.filter(s => s.id !== id),
            currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
          }));
        } catch (err) {
          set({ error: (err as Error).message });
        }
      }
    }),
    {
      name: 'ai-naming-sessions',
      partialize: (state) => ({ currentSessionId: state.currentSessionId }), // Only persist current session ID in localStorage
    }
  )
);
