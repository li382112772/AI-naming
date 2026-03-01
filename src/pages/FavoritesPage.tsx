import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { ChevronLeft, Trash2, Heart } from 'lucide-react';
import { fullName } from '@/lib/utils';
import { WuxingTag } from '@/components/ui/wuxing-tag';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, loadFavorites, removeFavorite, isLoading } = useFavorites();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">我的收藏</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无收藏的名字</p>
            <button 
              onClick={() => navigate('/')}
              className="text-amber-500 font-medium hover:underline"
            >
              去生成好名
            </button>
          </div>
        ) : (
          favorites.map((name) => (
            <div 
              key={name.id}
              onClick={() => navigate(`/names/${name.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3 items-center">
                  <span className="text-2xl font-serif font-bold text-gray-800">{fullName(name)}</span>
                  <div className="flex gap-1">
                    {name.characters.map((char, i) => (
                      <WuxingTag key={i} wuxing={char.wuxing} size="xs" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>已收藏</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {name.meaning}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>综合评分: <span className="text-amber-500 font-bold">{name.score}</span></span>
                <span>{(() => {
                  // id format: "name-{timestamp}-{index}" or "mock-name-{timestamp}-{index}"
                  const match = name.id?.match(/(\d{10,})/);
                  const ts = match ? parseInt(match[1]) : NaN;
                  return isNaN(ts) ? '收藏' : new Date(ts).toLocaleDateString('zh-CN');
                })()}</span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要取消收藏吗？')) {
                    removeFavorite(name.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
