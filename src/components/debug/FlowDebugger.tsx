import React from 'react';
import { useNamingFlow } from '@/hooks/useNamingFlow';
import { useSessions } from '@/hooks/useSessions';
import { useAI } from '@/hooks/useAI';
import { usePayment } from '@/hooks/usePayment';
import { Button } from '@/components/ui/button';

export const FlowDebugger: React.FC = () => {
  const { currentStep, startFlow, submitInfo, proceedToNaming, resetFlow } = useNamingFlow();
  const { currentSessionId, sessions } = useSessions();
  const { isGeneratingBazi, isGeneratingNames } = useAI();
  const { createOrder, simulatePayment, isProcessing } = usePayment();

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleTestFlow = async () => {
    try {
      if (currentStep === 'welcome') {
        startFlow();
      } else if (currentStep === 'input') {
        await submitInfo({
          lastName: '王',
          gender: 'boy',
          birthDate: '2024-05-20',
          birthTime: '08:00',
          birthCity: '上海',
          calendarType: 'solar'
        });
      } else if (currentStep === 'analysis-result') {
        await proceedToNaming();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlock = async () => {
    if (!currentSessionId) return;
    try {
      const orderId = await createOrder(9.9, 'all');
      await simulatePayment(orderId);
      alert('Unlocked successfully!');
    } catch {
      alert('Unlock failed');
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg text-xs font-mono space-y-2">
      <h3 className="text-sm font-bold text-green-400">Core Hooks Debugger</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>Current Step: <span className="text-yellow-400">{currentStep}</span></p>
          <p>Session ID: <span className="text-blue-400">{currentSessionId?.slice(0, 8)}...</span></p>
          <p>Bazi Loading: {isGeneratingBazi ? 'YES' : 'NO'}</p>
          <p>Names Loading: {isGeneratingNames ? 'YES' : 'NO'}</p>
          <p>Payment Processing: {isProcessing ? 'YES' : 'NO'}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={handleTestFlow} disabled={isGeneratingBazi || isGeneratingNames}>
            Next Step (Auto)
          </Button>
          
          <Button size="sm" variant="destructive" onClick={resetFlow}>
            Reset Flow
          </Button>

          {currentStep === 'name-list' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleUnlock}>
              Test Payment Unlock
            </Button>
          )}
        </div>
      </div>

      {currentSession && (
        <div className="mt-2 pt-2 border-t border-gray-700">
           <p>Names Generated: {currentSession.names?.length || 0}</p>
           <p>Unlocked: {currentSession.unlockedSeries?.includes('all') ? 'YES' : 'NO'}</p>
        </div>
      )}
    </div>
  );
};
