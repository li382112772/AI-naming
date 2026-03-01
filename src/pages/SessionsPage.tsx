import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useNamingFlow } from '@/hooks/useNamingFlow';
import { ChevronLeft, Trash2, Clock, Plus } from 'lucide-react';
export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSessions, deleteSession, setCurrentSession } = useSessions();
  const { startFlow } = useNamingFlow();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleResume = (id: string) => {
    setCurrentSession(id);
    navigate('/chat');
  };

  const handleNew = () => {
    startFlow(); // Resets flow
    navigate('/chat');
  };

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
        <h1 className="font-bold text-gray-800 text-lg">历史记录</h1>
        <button 
          onClick={handleNew}
          className="p-2 hover:bg-gray-100 rounded-full text-amber-500"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无起名记录</p>
            <button 
              onClick={handleNew}
              className="text-amber-500 font-medium hover:underline"
            >
              开始新会话
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => handleResume(session.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer relative group flex justify-between items-center"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-gray-800 text-lg">
                  {session.babyInfo?.lastName 
                    ? `宝宝姓${session.babyInfo.lastName}` 
                    : '新会话'}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
                {session.names && session.names.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    <span className="inline-block bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-full">
                      已生成 {session.names.length} 个名字
                    </span>
                    {session.selectedNameId && (
                      <span className="inline-block bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                         已选定：{(() => { const n = session.names.find(n => n.id === session.selectedNameId); return n ? (n.lastName ?? session.babyInfo?.lastName ?? '') + n.name : ''; })()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要删除这条记录吗？')) {
                    deleteSession(session.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
