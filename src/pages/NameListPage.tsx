import React, { useState, useEffect } from 'react';
import { useSessions } from '@/hooks/useSessions';
import { usePayment } from '@/hooks/usePayment';
import { useNamingFlow } from '@/hooks/useNamingFlow';
import { useAI } from '@/hooks/useAI';
import { NameList } from '@/components/naming/NameList';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AIBadge } from '@/components/ui/ai-badge';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { UnlockSuccess } from '@/components/payment/UnlockSuccess';
import { cn } from '@/lib/utils';
import { AIGenerating } from '@/components/ui/ai-generating';

const DEFAULT_STYLES = [
  { id: '诗词雅韵', label: '诗词雅韵' },
  { id: '山河大气', label: '山河大气' },
  { id: '现代简约', label: '现代简约' }
];

export const NameListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, sessions } = useSessions();
  const { createOrder, simulatePayment, isProcessing } = usePayment();
  const { setStep } = useNamingFlow();
  const { generateNames, isGeneratingNames } = useAI();

  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Resolve tabs: use AI-generated styles if available, else defaults
  const STYLES = currentSession?.baziAnalysis?.suggestedStyles && currentSession.baziAnalysis.suggestedStyles.length > 0
    ? currentSession.baziAnalysis.suggestedStyles.map(s => ({ id: s.id, label: s.title }))
    : DEFAULT_STYLES;

  // Set initial active tab from session preference or first style
  useEffect(() => {
    if (currentSession?.stylePreference && !activeTab) {
      setActiveTab(currentSession.stylePreference);
    } else if (!activeTab && STYLES.length > 0) {
      setActiveTab(STYLES[0].id);
    }
  }, [currentSession?.stylePreference, STYLES.length]);

  // Filter names by active tab
  const names = (currentSession?.names || []).filter(n => n.style === activeTab);

  // Auto-generate if empty and not generating
  useEffect(() => {
    if (activeTab && names.length === 0 && !isGeneratingNames && currentSession?.baziAnalysis) {
       generateNames(activeTab).catch(console.error);
    }
  }, [activeTab, names.length, isGeneratingNames, currentSession?.baziAnalysis]);

  const handleBack = () => {
    setStep('style-selection');
    navigate('/chat');
  };

  const handleUnlockClick = () => {
    setShowPayment(true);
  };

  const handlePayment = async (type: 'single' | 'all') => {
    try {
      // Determine price and seriesId based on type
      const price = type === 'single' ? 9.9 : 19.9;
      const seriesId = type === 'single' 
        ? activeTab 
        : 'all';

      // 1. Create Order
      const orderId = await createOrder(price, seriesId);
      // 2. Simulate Payment
      const success = await simulatePayment(orderId);
      
      if (success) {
        setShowPayment(false);
        setShowSuccess(true);
        // Hide success animation after 2s
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNameClick = (name: any) => {
    navigate(`/names/${name.id}`);
  };

  if (!currentSession) {
    return <div className="p-4 text-center">Session not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-800">AI 推荐结果</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4 py-2 flex gap-4 overflow-x-auto no-scrollbar">
        {STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => setActiveTab(style.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === style.id 
                ? "bg-amber-100 text-amber-800 border border-amber-200" 
                : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100"
            )}
          >
            {style.label}
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
           <div className="flex items-center gap-2 mb-1">
             <AIBadge />
             <h2 className="font-bold text-blue-900">
               {isGeneratingNames ? 'AI 正在思考...' : `为您生成了 ${names.length} 个好名`}
             </h2>
           </div>
           <p className="text-sm text-blue-700 opacity-80">
             基于 {STYLES.find(s => s.id === activeTab)?.label ?? activeTab} 风格，结合八字喜用神推荐
           </p>
        </div>

        {/* Loading State */}
        {isGeneratingNames && names.length === 0 && (
          <div className="py-10">
             <AIGenerating message={`正在生成${activeTab}风格的名字...`} className="bg-white shadow-sm" />
          </div>
        )}

        {/* Name List */}
        {!isGeneratingNames && names.length > 0 && (
          <NameList 
            names={names}
            onNameClick={handleNameClick}
            onUnlock={handleUnlockClick}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPay={handlePayment}
        isProcessing={isProcessing}
        seriesName={STYLES.find(s => s.id === activeTab)?.label ?? activeTab}
        allSeriesNames={STYLES.map(s => s.label)}
      />

      {/* Success Animation */}
      <UnlockSuccess show={showSuccess} />
    </div>
  );
};

