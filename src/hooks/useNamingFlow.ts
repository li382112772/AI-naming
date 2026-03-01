import { create } from 'zustand';
import { BabyInfo } from '@/types';
import { useSessions } from './useSessions';
import { useAI } from './useAI';

type FlowStep = 'welcome' | 'input' | 'analyzing' | 'analysis-result' | 'generating-names' | 'name-list';

interface NamingFlowState {
  currentStep: FlowStep;
  
  // Actions
  startFlow: () => void;
  submitInfo: (info: BabyInfo) => Promise<void>;
  proceedToNaming: () => Promise<void>;
  selectStyle: (style: string) => Promise<void>;
  resetFlow: () => void;
  setStep: (step: FlowStep) => void;
}

export const useNamingFlow = create<NamingFlowState>((set) => ({
  currentStep: 'welcome',

  setStep: (step: FlowStep) => {
    set({ currentStep: step });
  },

  startFlow: () => {
    const { setCurrentSession } = useSessions.getState();
    setCurrentSession(null); // Clear previous session
    set({ currentStep: 'input' });
  },

  submitInfo: async (info: BabyInfo) => {
    const { createSession } = useSessions.getState();
    const { generateBazi } = useAI.getState();

    try {
      // 1. Create Session
      await createSession(info);

      // 2. Move to analyzing
      set({ currentStep: 'analyzing' });

      // 3. Trigger AI bazi analysis
      const baziResult = await generateBazi();

      // 4. Show analysis result briefly, then auto-proceed to name generation
      set({ currentStep: 'analysis-result' });

      // 5. Auto-select first style and generate names
      const firstStyle = baziResult.suggestedStyles?.[0];
      if (firstStyle) {
        const { updateSession, currentSessionId } = useSessions.getState();
        if (currentSessionId) {
          await updateSession(currentSessionId, { stylePreference: firstStyle.id });
        }
        set({ currentStep: 'generating-names' });
        const { generateNames } = useAI.getState();
        await generateNames(firstStyle.id);
        set({ currentStep: 'name-list' });
      }
    } catch (error) {
      console.error('Flow Error:', error);
      // Stay on current step — ChatPage will show the error bubble from useAI.error
    }
  },

  proceedToNaming: async () => {
    const { generateNames } = useAI.getState();
    const { sessions, currentSessionId, updateSession } = useSessions.getState();
    const session = sessions.find((s) => s.id === currentSessionId);
    const firstStyle = session?.baziAnalysis?.suggestedStyles?.[0];
    if (!firstStyle) return;

    try {
      if (currentSessionId) {
        await updateSession(currentSessionId, { stylePreference: firstStyle.id });
      }
      set({ currentStep: 'generating-names' });
      await generateNames(firstStyle.id);
      set({ currentStep: 'name-list' });
    } catch (error) {
      console.error('Flow Error:', error);
      set({ currentStep: 'analysis-result' });
    }
  },

  selectStyle: async (style: string) => {
    const { generateNames } = useAI.getState();
    const { updateSession, currentSessionId } = useSessions.getState();

    try {
      // 1. Update preference
      if (currentSessionId) {
        await updateSession(currentSessionId, { stylePreference: style });
      }

      // 2. Move to generating
      set({ currentStep: 'generating-names' });

      // 3. Trigger AI
      await generateNames(style);

      // 4. Move to list
      set({ currentStep: 'name-list' });
    } catch (error) {
      console.error('Flow Error:', error);
      // Revert to analysis-result so the user can try again
      set({ currentStep: 'analysis-result' });
    }
  },

  resetFlow: () => {
    set({ currentStep: 'welcome' });
  }
}));
