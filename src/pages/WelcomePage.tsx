import React from 'react';
import { Button } from '@/components/ui/button';
import { useNamingFlow } from '@/hooks/useNamingFlow';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomePage: React.FC = () => {
  const { startFlow } = useNamingFlow();
  const navigate = useNavigate();

  const handleStart = () => {
    startFlow();
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6 max-w-md"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
          <Sparkles className="w-3 h-3" />
          <span>AI 赋能，名承古今</span>
        </div>

        <h1 className="text-4xl font-serif font-bold text-gray-900 leading-tight">
          为宝宝<br />
          <span className="text-amber-600">起一个好名字</span>
        </h1>

        <p className="text-gray-500 leading-relaxed">
          以千年文化为根，借 AI 智慧为翼，精准定制
          <br />
          独一无二、寓意深远的好名字。
        </p>

        <div className="pt-8 space-y-4">
          <Button 
            size="lg" 
            onClick={handleStart}
            className="w-full h-14 text-lg rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-200"
          >
            立即开启起名之旅
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate('/favorites')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              <Heart className="w-4 h-4 text-red-400" />
              我的收藏
            </button>
            <button 
              onClick={() => navigate('/sessions')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              历史记录
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-400">
            已有 10,000+ 家庭选择
          </p>
        </div>
      </motion.div>
    </div>
  );
};
