import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { NameDetailPage as NameDetailComponent } from '@/components/naming/NameDetailPage';

export const NameDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions } = useSessions();
  
  // Find name across all sessions (simplified)
  // In real app, we might want to know which session context we are in
  let foundName = null;
  for (const session of sessions) {
    if (session.names) {
      const name = session.names.find(n => n.id === id);
      if (name) {
        foundName = name;
        break;
      }
    }
  }

  if (!foundName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Name not found
      </div>
    );
  }

  return (
    <NameDetailComponent 
      name={foundName} 
      onBack={() => navigate(-1)} 
    />
  );
};
