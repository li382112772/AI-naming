import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface AIGeneratingProps {
  message?: string;
  className?: string;
}

export const AIGenerating: React.FC<AIGeneratingProps> = ({ 
  message = "AI 正在思考中...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
      <motion.div
        animate={{
          y: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-full shadow-lg shadow-blue-200">
          <Bot className="w-8 h-8 text-white" />
        </div>
        
        {/* Particle effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute inset-0 bg-blue-400 rounded-full -z-10"
        />
      </motion.div>

      <div className="flex flex-col items-center space-y-2">
        <p className="text-sm text-gray-500 font-medium">{message}</p>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
