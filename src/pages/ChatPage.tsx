import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNamingFlow } from '@/hooks/useNamingFlow';
import { useSessions } from '@/hooks/useSessions';
import { useAI } from '@/hooks/useAI';
import { usePayment } from '@/hooks/usePayment';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from '@/components/ui/chat-bubble';
import { AIGenerating } from '@/components/ui/ai-generating';
import { BaziAnalysisCard } from '@/components/bazi/BaziAnalysisCard';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { BabyInfo } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Heart, Clock as ClockIcon, Menu } from 'lucide-react';
import { StyleSelectionCarousel } from '@/components/chat/StyleSelectionCarousel';
import { InlineNamePreview } from '@/components/chat/InlineNamePreview';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { UnlockSuccess } from '@/components/payment/UnlockSuccess';
import { NameDetailPage } from '@/components/naming/NameDetailPage';
import { NameDetail } from '@/types';
import { X } from 'lucide-react';

// Phased loading messages for AI analysis
const BAZI_LOADING_PHASES = [
  '正在排盘计算...',
  '分析四柱八字...',
  '推算五行分布...',
  '计算喜用神...',
  'AI 正在生成分析报告...',
];
const NAME_LOADING_PHASES = [
  '解析八字喜用...',
  '匹配风格意境...',
  '甄选汉字组合...',
  '推敲音韵搭配...',
  'AI 正在精心构思好名...',
];

function useLoadingPhase(isLoading: boolean, phases: string[]) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setPhaseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPhaseIndex((prev) =>
        prev < phases.length - 1 ? prev + 1 : prev
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading, phases.length]);

  return phases[phaseIndex];
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentStep, 
    submitInfo, 
    confirmAnalysis, 
    selectStyle,
    setStep 
  } = useNamingFlow();
  
  const { currentSessionId, sessions, updateSession } = useSessions();
  const { isGeneratingBazi, isGeneratingNames, error: aiError } = useAI();
  const { createOrder, simulatePayment, isProcessing } = usePayment();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Phased loading messages
  const baziLoadingMsg = useLoadingPhase(isGeneratingBazi, BAZI_LOADING_PHASES);
  const nameLoadingMsg = useLoadingPhase(isGeneratingNames, NAME_LOADING_PHASES);
  
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Sync Step with Session State on Mount/Change
  useEffect(() => {
    if (!currentSession) {
      if (currentStep !== 'welcome' && currentStep !== 'input') {
        setStep('input');
      }
      return;
    }

    // Determine step based on session data
    if (currentSession.names && currentSession.names.length > 0) {
      if (currentStep !== 'name-list') setStep('name-list');
    } else if (currentSession.stylePreference) {
      // If style selected but no names, maybe we were interrupted?
      // Or maybe just show selection to let them try again
      if (currentStep !== 'style-selection') setStep('style-selection');
    } else if (currentSession.baziAnalysis) {
      if (currentStep !== 'analysis-result' && currentStep !== 'style-selection') {
        setStep('analysis-result');
      }
    } else if (currentSession.babyInfo) {
      // Info submitted but no analysis yet? 
      // This is rare (interrupted during analysis), might need to re-trigger or show input
      if (currentStep === 'input') {
        // If we are in input, but have info, maybe we should just fill the form?
        // For now, let's assume if we have session, we at least moved past input if we have analysis
      }
    }
  }, [currentSessionId, currentSession]); // Depend on ID switch or session update

  // Form State
  const [formData, setFormData] = useState<Partial<BabyInfo>>({
    lastName: '',
    gender: 'boy',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    calendarType: 'solar',
    nameLength: 2,
  });

  // Helper: resolve style display title from its ID
  const getStyleTitle = (styleId?: string): string => {
    if (!styleId) return styleId ?? ''
    const found = currentSession?.baziAnalysis?.suggestedStyles?.find(s => s.id === styleId)
    return found?.title ?? styleId
  }

  // Inline Preview State
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedNameForDetail, setSelectedNameForDetail] = useState<NameDetail | null>(null);
  const [isSelectionConfirmed, setIsSelectionConfirmed] = useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, isGeneratingBazi, isGeneratingNames, currentPreviewIndex, selectedNameForDetail, isSelectionConfirmed]);

  // Remove auto-navigation to list
  // Instead, we handle the 'name-list' step by showing the InlineNamePreview

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName || !formData.birthDate) return;
    
    await submitInfo(formData as BabyInfo);
  };

  const updateForm = (key: keyof BabyInfo, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePreviewRefresh = () => {
    if (!currentSession?.names) return;
    
    const styleNames = currentSession.names.filter(n => n.style === currentSession.stylePreference);
    const nextIndex = currentPreviewIndex + 1;
    
    // If next index exists
    if (nextIndex < styleNames.length) {
       const nextName = styleNames[nextIndex];
       // Check if locked
       if (nextName.isLocked) {
         setShowPayment(true);
       } else {
         setCurrentPreviewIndex(nextIndex);
       }
    } else {
       // Loop back or show payment if end reached? 
       // For now, let's just trigger payment if they want "more" than what's available
       setShowPayment(true); 
    }
  };

  const handlePayment = async (type: 'single' | 'all') => {
    try {
      const price = type === 'single' ? 9.9 : 19.9;
      const seriesId = type === 'single' 
        ? (currentSession?.stylePreference || 'current') 
        : 'all';

      const orderId = await createOrder(price, seriesId);
      const success = await simulatePayment(orderId);
      
      if (success) {
        setShowPayment(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Advance to next name if we were blocked
        const styleNames = currentSession?.names?.filter(n => n.style === currentSession.stylePreference) || [];
        if (styleNames && currentPreviewIndex + 1 < styleNames.length) {
            setCurrentPreviewIndex(prev => prev + 1);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter names for current style
  const styleNames = currentSession?.names?.filter(n => n.style === currentSession.stylePreference) || [];
  const currentName = styleNames[currentPreviewIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/sessions')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="历史记录"
        >
          <ClockIcon className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-800">AI 起名顾问</h1>
        <button 
          onClick={() => navigate('/favorites')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="我的收藏"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* 1. Welcome Message */}
        <ChatBubble 
          role="assistant"
          content="您好！我是您的 AI 起名顾问。请告诉我宝宝的出生信息，我将为您分析八字并推荐好名。"
        />

        {/* 2. Input Form */}
        <AnimatePresence>
          {currentStep === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <form onSubmit={handleInfoSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1 h-4 bg-amber-500 rounded-full" />
                   <h3 className="font-bold text-gray-800">填写宝宝信息</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-xs">姓氏</Label>
                    <Input 
                      placeholder="请输入姓氏" 
                      value={formData.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      className="border-gray-200 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-xs">性别</Label>
                    <div className="flex gap-2">
                      {['boy', 'girl', 'unknown'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateForm('gender', g)}
                          className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                            formData.gender === g 
                              ? 'bg-amber-50 border-amber-500 text-amber-700' 
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {g === 'boy' ? '男' : g === 'girl' ? '女' : '未定'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-gray-500 text-xs">出生日期 (公历)</Label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                     <Input 
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateForm('birthDate', e.target.value)}
                        className="pl-9 border-gray-200 focus:border-amber-500"
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-gray-500 text-xs">出生时间 (选填)</Label>
                     <div className="relative">
                       <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                       <Input 
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => updateForm('birthTime', e.target.value)}
                          className="pl-9 border-gray-200 focus:border-amber-500"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-gray-500 text-xs">出生地点 (选填)</Label>
                     <div className="relative">
                       <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                       <Input 
                          placeholder="城市"
                          value={formData.birthCity}
                          onChange={(e) => updateForm('birthCity', e.target.value)}
                          className="pl-9 border-gray-200 focus:border-amber-500"
                       />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500 text-xs">名字字数</Label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => updateForm('nameLength', len)}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                          formData.nameLength === len
                            ? 'bg-amber-50 border-amber-500 text-amber-700 font-semibold'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {len === 1 ? '单字名' : len === 2 ? '两字名' : '三字名'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!formData.lastName || !formData.birthDate}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-100 h-11 rounded-xl font-bold"
                >
                  开始智能分析
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. User Input Display (After submission) */}
        {currentStep !== 'input' && currentStep !== 'welcome' && (
          <ChatBubble 
            role="user"
            content={`宝宝姓${currentSession?.babyInfo.lastName}，${currentSession?.babyInfo.gender === 'boy' ? '男孩' : currentSession?.babyInfo.gender === 'girl' ? '女孩' : '性别未定'}，${currentSession?.babyInfo.birthDate} ${currentSession?.babyInfo.birthTime || ''} ${currentSession?.babyInfo.birthCity ? `出生于${currentSession.babyInfo.birthCity}` : ''}。`}
          />
        )}

        {/* 4. AI Analyzing */}
        <AnimatePresence>
          {isGeneratingBazi && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AIGenerating message={baziLoadingMsg} className="bg-white rounded-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4.5. AI Error Display */}
        {aiError && !isGeneratingBazi && !isGeneratingNames && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChatBubble
              role="assistant"
              content={`抱歉，AI 分析过程中遇到问题：${aiError}。请重新尝试。`}
            />
          </motion.div>
        )}

        {/* 5. Analysis Result */}
        {(currentStep === 'analysis-result' || currentStep === 'style-selection' || currentStep === 'generating-names' || currentStep === 'name-list') && currentSession?.baziAnalysis && (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
          >
            <ChatBubble 
              role="assistant"
              content="八字分析已完成！这是宝宝的命理分析报告："
            />
            <ErrorBoundary fallbackTitle="八字分析加载失败">
              <BaziAnalysisCard data={currentSession.baziAnalysis} babyInfo={currentSession.babyInfo} />
            </ErrorBoundary>
            
            {currentStep === 'analysis-result' && (
              <div className="mt-4 flex justify-center">
                <Button onClick={confirmAnalysis} className="bg-blue-500 hover:bg-blue-600 rounded-full px-8 shadow-lg shadow-blue-200">
                  下一步：选择起名风格
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* 6. Style Selection */}
        {(currentStep === 'style-selection' || currentStep === 'generating-names' || currentStep === 'name-list') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <ChatBubble 
              role="assistant"
              content="请选择您喜欢的名字风格："
            />
            <StyleSelectionCarousel
               onSelect={selectStyle}
               disabled={currentStep === 'generating-names' || currentStep === 'name-list'}
               styles={currentSession?.baziAnalysis?.suggestedStyles}
            />
          </motion.div>
        )}

        {/* 7. Generating Names */}
        <AnimatePresence>
          {isGeneratingNames && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChatBubble role="user" content={`我选择了：${getStyleTitle(currentSession?.stylePreference)}`} />
              <AIGenerating message={nameLoadingMsg} className="bg-white rounded-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 8. Inline Name Preview (The First Result) */}
        {currentStep === 'name-list' && !isGeneratingNames && currentName && (
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
           >
             <ChatBubble 
               role="assistant"
               content={`为您生成了 ${styleNames.length} 个${getStyleTitle(currentSession?.stylePreference)}风格的好名，首选推荐：`}
             />
             <ErrorBoundary fallbackTitle="名字预览加载失败">
               <InlineNamePreview
                 name={currentName}
                 onRefresh={handlePreviewRefresh}
                 onViewDetail={() => setSelectedNameForDetail(currentName)}
                 onViewList={() => navigate('/names')}
                 onFavorite={() => {
                   if (isFavorite(currentName.id)) {
                     removeFavorite(currentName.id);
                   } else {
                     addFavorite(currentName);
                   }
                 }}
                 onSelect={async () => {
                  if (currentSessionId) {
                    await updateSession(currentSessionId, { selectedNameId: currentName.id });
                    setIsSelectionConfirmed(true);
                  }
                }}
                isFavorite={isFavorite(currentName.id)}
               />
             </ErrorBoundary>
           </motion.div>
        )}

        {/* 9. Selection Confirmation */}
        {isSelectionConfirmed && currentSession?.names?.find(n => n.id === currentSession.selectedNameId) && (
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
           >
             <ChatBubble 
               role="assistant"
               content={`太棒了！已为您选定名字「${currentSession.names.find(n => n.id === currentSession.selectedNameId)?.name}」。愿这个好名字伴随宝宝健康快乐成长！您可以点击右上角收藏夹查看或管理收藏的名字。`}
             />
           </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNameForDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full h-[90vh] sm:h-[80vh] sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedNameForDetail(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="h-full overflow-y-auto">
                <ErrorBoundary fallbackTitle="名字详情加载失败">
                  <NameDetailPage
                    name={selectedNameForDetail}
                    onBack={() => setSelectedNameForDetail(null)}
                    className="min-h-full pb-0 pt-0"
                  />
                </ErrorBoundary>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal for Inline "Next" */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPay={handlePayment}
        isProcessing={isProcessing}
        seriesName={getStyleTitle(currentSession?.stylePreference)}
        allSeriesNames={currentSession?.baziAnalysis?.suggestedStyles?.map(s => s.title)}
      />

      <UnlockSuccess show={showSuccess} />
    </div>
  );
};