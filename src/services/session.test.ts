import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession, updateSession, deleteSession, listSessions } from './session';
import { BabyInfo } from '@/types';
import { sessionsStore } from './db';

describe('Session Service', () => {
  const mockBabyInfo: BabyInfo = {
    lastName: 'Li',
    gender: 'boy',
    birthDate: '2023-01-01',
    birthTime: '12:00',
    birthCity: 'Beijing',
    calendarType: 'solar'
  };

  beforeEach(async () => {
    await sessionsStore.clear();
  });

  it('should create a new session', async () => {
    const session = await createSession(mockBabyInfo);
    expect(session.id).toBeDefined();
    expect(session.babyInfo).toEqual(mockBabyInfo);
    expect(session.createdAt).toBeDefined();
  });

  it('should get a session by id', async () => {
    const created = await createSession(mockBabyInfo);
    const retrieved = await getSession(created.id);
    expect(retrieved).toEqual(created);
  });

  it('should update a session', async () => {
    const created = await createSession(mockBabyInfo);
    const updated = await updateSession(created.id, { stylePreference: 'poetry' });
    expect(updated?.stylePreference).toBe('poetry');
    
    const retrieved = await getSession(created.id);
    expect(retrieved?.stylePreference).toBe('poetry');
  });

  it('should delete a session', async () => {
    const created = await createSession(mockBabyInfo);
    await deleteSession(created.id);
    const retrieved = await getSession(created.id);
    expect(retrieved).toBeNull();
  });

  it('should list all sessions', async () => {
    await createSession(mockBabyInfo);
    await createSession({ ...mockBabyInfo, lastName: 'Wang' });
    const sessions = await listSessions();
    expect(sessions.length).toBe(2);
  });
});
