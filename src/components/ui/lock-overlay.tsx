import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LockOverlayProps {
  price?: string;
  onUnlock?: () => void;
  title?: string;
  description?: string;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
  price = "9.9",
  onUnlock,
  title = "解锁查看完整解析",
  description = "含五行、音韵、专属寓意等深度分析"
}) => {
  return (
    <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center z-10 rounded-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/90 p-6 rounded-2xl shadow-xl border border-amber-100 text-center max-w-[80%]"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        
        <h3 className="text-gray-900 font-bold mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-4">{description}</p>
        
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold py-2.5 rounded-full shadow-md shadow-orange-200 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <span>立即解锁</span>
          <span className="text-xs opacity-90">¥{price}</span>
        </button>
      </motion.div>
    </div>
  );
};
