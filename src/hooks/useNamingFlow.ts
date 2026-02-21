import { create } from 'zustand';
import { BabyInfo } from '@/types';
import { useSessions } from './useSessions';
import { useAI } from './useAI';

type FlowStep = 'welcome' | 'input' | 'analyzing' | 'analysis-result' | 'style-selection' | 'generating-names' | 'name-list';

interface NamingFlowState {
  currentStep: FlowStep;
  
  // Actions
  startFlow: () => void;
  submitInfo: (info: BabyInfo) => Promise<void>;
  confirmAnalysis: () => void;
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

      // 3. Trigger AI
      await generateBazi();

      // 4. Move to result
      set({ currentStep: 'analysis-result' });
    } catch (error) {
      console.error('Flow Error:', error);
      // Stay on 'analyzing' step — ChatPage will show the error bubble from useAI.error
    }
  },

  confirmAnalysis: () => {
    set({ currentStep: 'style-selection' });
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
      // Revert to style-selection so the user can try again
      set({ currentStep: 'style-selection' });
    }
  },

  resetFlow: () => {
    set({ currentStep: 'welcome' });
  }
}));
