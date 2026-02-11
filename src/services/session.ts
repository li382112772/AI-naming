import { BabyInfo, BabySession } from '@/types';
import { sessionsStore } from './db';

export async function createSession(babyInfo: BabyInfo): Promise<BabySession> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const session: BabySession = {
    id,
    babyInfo,
    createdAt: now,
    updatedAt: now,
  };
  await sessionsStore.setItem(id, session);
  return session;
}

export async function getSession(id: string): Promise<BabySession | null> {
  return await sessionsStore.getItem<BabySession>(id);
}

export async function updateSession(id: string, updates: Partial<BabySession>): Promise<BabySession | null> {
  const session = await getSession(id);
  if (!session) return null;
  
  const updatedSession = {
    ...session,
    ...updates,
    updatedAt: Date.now()
  };
  await sessionsStore.setItem(id, updatedSession);
  return updatedSession;
}

export async function deleteSession(id: string): Promise<void> {
  await sessionsStore.removeItem(id);
}

export async function listSessions(): Promise<BabySession[]> {
  const sessions: BabySession[] = [];
  await sessionsStore.iterate((value: BabySession) => {
    sessions.push(value);
  });
  // Sort by createdAt desc
  return sessions.sort((a, b) => b.createdAt - a.createdAt);
}
