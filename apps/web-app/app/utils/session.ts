import { redirect } from 'react-router';
import { getStorageService } from '../services/storage';
import { getStorageConfig } from '../services/config';

export interface SessionData {
  userId?: string;
  [key: string]: unknown;
}

class ClientSession {
  private data: SessionData = {};
  private storageService = getStorageService(getStorageConfig());

  constructor(initialData?: SessionData) {
    this.data = initialData || {};
  }

  get(key: string): unknown {
    return this.data[key];
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
    // Save to storage service asynchronously
    this.saveToStorage().catch(error => {
      console.error('Error saving session:', error);
    });
  }

  unset(key: string): void {
    delete this.data[key];
    // Save to storage service asynchronously
    this.saveToStorage().catch(error => {
      console.error('Error updating session:', error);
    });
  }

  has(key: string): boolean {
    return key in this.data;
  }

  getData(): SessionData {
    return { ...this.data };
  }

  private async saveToStorage(): Promise<void> {
    try {
      await this.storageService.setSession(this.data);
    } catch (error) {
      console.error('Error saving session to storage service:', error);
      // Fallback to localStorage for backward compatibility
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('polyglottos_session', JSON.stringify(this.data));
        } catch (fallbackError) {
          console.error('Error saving session to localStorage fallback:', fallbackError);
        }
      }
    }
  }
}

export async function getSession(): Promise<ClientSession> {
  if (typeof window === 'undefined') {
    return new ClientSession();
  }

  try {
    const storageService = getStorageService(getStorageConfig());
    const sessionData = await storageService.getSession();
    return new ClientSession(sessionData);
  } catch (error) {
    console.error('Error reading session from storage service:', error);
    
    // Fallback to localStorage for backward compatibility
    try {
      const sessionData = localStorage.getItem('polyglottos_session');
      const data = sessionData ? JSON.parse(sessionData) : {};
      return new ClientSession(data);
    } catch (fallbackError) {
      console.error('Error reading session from localStorage fallback:', fallbackError);
      return new ClientSession();
    }
  }
}

export async function commitSession(): Promise<string> {
  return '';
}

export async function destroySession(): Promise<string> {
  try {
    const storageService = getStorageService(getStorageConfig());
    await storageService.clearSession();
  } catch (error) {
    console.error('Error clearing session from storage service:', error);
    
    // Fallback to localStorage for backward compatibility
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('polyglottos_session');
      } catch (fallbackError) {
        console.error('Error removing session from localStorage fallback:', fallbackError);
      }
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
