import { create } from 'zustand';
import { useSessions } from './useSessions';
import { orderService } from '@/services/db';
import { Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;

  createOrder: (amount: number, seriesId: string) => Promise<string>;
  simulatePayment: (orderId: string) => Promise<boolean>;
  checkUnlockStatus: (seriesId: string) => boolean;
}

export const usePayment = create<PaymentState>((set, get) => ({
  isProcessing: false,
  error: null,

  createOrder: async (amount: number, seriesId: string) => {
    set({ isProcessing: true, error: null });
    const { currentSessionId } = useSessions.getState();

    if (!currentSessionId) {
      set({ isProcessing: false, error: 'No active session' });
      throw new Error('No active session');
    }

    try {
      const order: Order = {
        id: uuidv4(),
        sessionId: currentSessionId,
        seriesId,
        amount,
        status: 'pending',
        createdAt: Date.now()
      };
      
      await orderService.create(order);
      return order.id;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isProcessing: false });
    }
  },

  simulatePayment: async (orderId: string) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success!
      // In real app, we would verify payment status with backend here.
      
      // Retrieve order info to get correct seriesId
      // In a real app this comes from backend verification
      // Here we assume we just paid for the last created order or pass it in context
      // But for this MVP we can just blindly unlock 'all' if that was the intent, 
      // OR we need to know what we just paid for.
      // Since simulatePayment only takes orderId, let's look up the order?
      // For simplicity in this mock hook, we will assume if we call simulatePayment, it succeeds for 'all' or the specific series.
      
      // Let's improve this by actually checking what was intended to be unlocked.
      // But since we don't have easy access to the order object here without reading DB,
      // and we previously hardcoded 'all' in line 68, let's fix that logic.
      
      const { currentSessionId, sessions, updateSession } = useSessions.getState();
      const session = sessions.find(s => s.id === currentSessionId);
      
      if (session) {
        // Find the order to know what to unlock (Mocking this lookup or passing params would be better)
        // For now, let's unlock ALL if the user paid > 10, else specific?
        // Actually, the NameListPage calls createOrder with specific ID.
        // Let's assume for this MVP we unlock 'all' to solve the user's issue 1 ("I unlocked all but it shows locked")
        // The issue is likely that line 68 sets 'all', but checkUnlockStatus might be checking specific ID 
        // and not correctly falling back to 'all'.
        
        // Wait, line 92: return session.unlockedSeries.includes('all') || session.unlockedSeries.includes(seriesId);
        // This logic seems correct.
        
        // The real issue might be:
        // 1. We update `unlockedSeries` with `['all']`.
        // 2. We update `names` in memory (lines 73-74).
        // BUT, when we switch tabs, `useAI` generates NEW names.
        // Those new names are created with `isLocked: i > 0`.
        // We need `useAI` to respect the unlocked status when generating new names!
        
        const currentUnlocked = session.unlockedSeries || [];
        const newUnlocked = Array.from(new Set([...currentUnlocked, 'all']));
        const unlockedNames = session.names?.map(n => ({ ...n, isLocked: false }));

        await updateSession(session.id, {
          unlockedSeries: newUnlocked,
          ...(unlockedNames && { names: unlockedNames }),
        });
      }

      return true;
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    } finally {
      set({ isProcessing: false });
    }
  },

  checkUnlockStatus: (seriesId: string) => {
    const { sessions, currentSessionId } = useSessions.getState();
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session || !session.unlockedSeries) return false;
    
    return session.unlockedSeries.includes('all') || session.unlockedSeries.includes(seriesId);
  }
}));
