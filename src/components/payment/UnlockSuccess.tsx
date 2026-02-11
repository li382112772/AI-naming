import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface UnlockSuccessProps {
  show: boolean;
  onComplete?: () => void;
}

export const UnlockSuccess: React.FC<UnlockSuccessProps> = ({ show, onComplete }) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="bg-white rounded-full p-8 flex flex-col items-center justify-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200"
            >
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </motion.div>
            
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold text-gray-800"
            >
              解锁成功！
            </motion.h3>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
