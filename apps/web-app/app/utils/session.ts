import { redirect } from 'react-router';

export interface SessionData {
  userId?: string;
  [key: string]: unknown;
}

class ClientSession {
  private data: SessionData = {};

  constructor(initialData?: SessionData) {
    this.data = initialData || {};
  }

  get(key: string): unknown {
    return this.data[key];
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('polyglottos_session', JSON.stringify(this.data));
      } catch (error) {
        console.error('Error saving session to localStorage:', error);
      }
    }
  }

  unset(key: string): void {
    delete this.data[key];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('polyglottos_session', JSON.stringify(this.data));
      } catch (error) {
        console.error('Error updating session in localStorage:', error);
      }
    }
  }

  has(key: string): boolean {
    return key in this.data;
  }

  getData(): SessionData {
    return { ...this.data };
  }
}

export async function getSession(): Promise<ClientSession> {
  if (typeof window === 'undefined') {
    return new ClientSession();
  }

  try {
    const sessionData = localStorage.getItem('polyglottos_session');
    const data = sessionData ? JSON.parse(sessionData) : {};
    return new ClientSession(data);
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return new ClientSession();
  }
}

export async function commitSession(): Promise<string> {
  return '';
}

export async function destroySession(): Promise<string> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('polyglottos_session');
    } catch (error) {
      console.error('Error removing session from localStorage:', error);
    }
  }
  return '';
}

export async function requireUser(): Promise<string> {
  const session = await getSession();
  const userId = session.get('userId') as string;

  if (!userId) {
    throw redirect('/login');
  }

  return userId;
}
