import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Sparkles, Gem } from 'lucide-react';
import { PriceTag } from './PriceTag';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (type: 'single' | 'all') => void;
  isProcessing: boolean;
  seriesName?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPay,
  isProcessing,
  seriesName = '当前系列'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'all'>('single');

  const plans = [
    {
      id: 'single' as const,
      title: '解锁当前系列',
      desc: `获取 ${seriesName} 全部 6 个名字详解`,
      price: 9.9,
      originalPrice: 29.9,
      icon: Sparkles,
      color: 'bg-amber-50 border-amber-200',
      activeBorder: 'border-amber-500 ring-1 ring-amber-500',
      features: ['解锁本系列全部名字', '查看详细寓意解析', '八字五行匹配分析']
    },
    {
      id: 'all' as const,
      title: '解锁全部系列',
      desc: '获取诗词/山河/现代等全风格名字',
      price: 19.9,
      originalPrice: 59.9,
      icon: Gem,
      color: 'bg-indigo-50 border-indigo-200',
      activeBorder: 'border-indigo-500 ring-1 ring-indigo-500',
      features: ['解锁所有风格系列', '永久查看权益', '包含八字五行分析', '优先获取新风格']
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white text-center shrink-0">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-1">解锁 AI 深度解析</h3>
              <p className="text-sm opacity-90">开启宝宝的人生好运</p>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  
                  return (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer",
                        plan.color,
                        isSelected ? plan.activeBorder : "border-transparent"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-full", isSelected ? "bg-white" : "bg-white/50")}>
                            <Icon className={cn("w-4 h-4", isSelected ? "text-gray-800" : "text-gray-500")} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{plan.title}</h4>
                            <p className="text-[10px] text-gray-500">{plan.desc}</p>
                          </div>
                        </div>
                        <PriceTag price={plan.price} originalPrice={plan.originalPrice} />
                      </div>

                      {/* Features */}
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-2 border-t border-black/5 mt-2 space-y-1.5"
                        >
                          {plan.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      
                      {/* Selection Circle */}
                      <div className={cn(
                        "absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300 bg-white"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 pt-0 mt-auto bg-white border-t border-gray-50">
               <div className="pt-4">
                  <Button 
                    onClick={() => onPay(selectedPlan)}
                    disabled={isProcessing}
                    className="w-full h-12 text-lg font-bold rounded-full bg-[#07C160] hover:bg-[#06ad56] text-white shadow-lg shadow-green-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>支付处理中...</span>
                      </div>
                    ) : (
                      `微信支付 ¥${plans.find(p => p.id === selectedPlan)?.price}`
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 mt-3">
                    <ShieldCheck className="w-3 h-3" />
                    <span>支付安全保障 · 24小时无理由退款</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
