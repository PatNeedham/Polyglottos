// Example usage of the storage service abstraction layer
// This file demonstrates how to use the storage service for common operations

import { getStorageService, StorageConfig } from '~/services/storage';
import { getStorageConfig } from '~/services/config';

/**
 * Example class showing how to integrate the storage service
 * into application components
 */
export class UserDataManager {
  private storage = getStorageService(getStorageConfig());

  /**
   * Initialize a new user with default data
   */
  async initializeUser(userId: string, username: string, email: string) {
    try {
      // Set user data
      await this.storage.setUserData({
        id: userId,
        username,
        email,
        createdAt: new Date().toISOString(),
      });

      // Initialize progress
      await this.storage.setProgressData({
        id: `progress_${userId}_${Date.now()}`,
        userId,
        questionsAnswered: 0,
        correctAnswers: 0,
        quizzesTaken: 0,
        lastUpdated: new Date().toISOString(),
      });

      // Set default settings
      await this.storage.setSettings({
        userId,
        language: 'en',
        theme: 'light',
        notificationFrequency: 'daily',
        isPrivate: false,
      });

      console.log(`User ${username} initialized successfully`);
    } catch (error) {
      console.error('Failed to initialize user:', error);
      throw error;
    }
  }

  /**
   * Update user progress after completing a quiz
   */
  async updateQuizProgress(userId: string, correctAnswers: number, totalQuestions: number) {
    try {
      const currentProgress = await this.storage.getProgressData(userId);
      
      if (currentProgress) {
        await this.storage.updateProgress(userId, {
          questionsAnswered: currentProgress.questionsAnswered + totalQuestions,
          correctAnswers: currentProgress.correctAnswers + correctAnswers,
          quizzesTaken: currentProgress.quizzesTaken + 1,
        });
      } else {
        // Create new progress record if none exists
        await this.storage.updateProgress(userId, {
          questionsAnswered: totalQuestions,
          correctAnswers,
          quizzesTaken: 1,
        });
      }

      console.log(`Progress updated for user ${userId}`);
    } catch (error) {
      console.error('Failed to update quiz progress:', error);
      throw error;
    }
  }

  /**
   * Get user dashboard data
   */
  async getDashboardData(userId: string) {
    try {
      const [userData, progressData, settings] = await Promise.all([
        this.storage.getUserData(userId),
        this.storage.getProgressData(userId),
        this.storage.getSettings(userId),
      ]);

      return {
        user: userData,
        progress: progressData,
        settings,
      };
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      return {
        user: null,
        progress: null,
        settings: null,
      };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: {
    theme?: string;
    language?: string;
    notificationFrequency?: string;
  }) {
    try {
      await this.storage.updateSettings(userId, preferences);
      console.log('User preferences updated successfully');
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Handle user login - set session
   */
  async loginUser(userId: string) {
    try {
      await this.storage.setSession({
        userId,
        loginTime: new Date().toISOString(),
      });
      console.log(`User ${userId} logged in successfully`);
    } catch (error) {
      console.error('Failed to set user session:', error);
      throw error;
    }
  }

  /**
   * Handle user logout - clear session
   */
  async logoutUser() {
    try {
      await this.storage.clearSession();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Failed to clear user session:', error);
      throw error;
    }
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      const session = await this.storage.getSession();
      return !!session.userId;
    } catch (error) {
      console.error('Failed to check user session:', error);
      return false;
    }
  }

  /**
   * Get current user ID from session
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const session = await this.storage.getSession();
      return session.userId as string || null;
    } catch (error) {
      console.error('Failed to get current user ID:', error);
      return null;
    }
  }

  /**
   * Check storage availability and switch if needed
   */
  async checkStorageHealth() {
    try {
      const isAvailable = await this.storage.isAvailable();
      
      if (!isAvailable) {
        console.warn('Primary storage is not available. Service will use fallback storage.');
        // The storage service will automatically handle fallback
      }
      
      return isAvailable;
    } catch (error) {
      console.error('Storage health check failed:', error);
      return false;
    }
  }

  /**
   * Export user data for backup or migration
   */
  async exportUserData(userId: string) {
    try {
      const [userData, progressData, settings] = await Promise.all([
        this.storage.getUserData(userId),
        this.storage.getProgressData(userId),
        this.storage.getSettings(userId),
      ]);

      const exportData = {
        user: userData,
        progress: progressData,
        settings,
        exportDate: new Date().toISOString(),
      };

      return exportData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }
}

/**
 * Example of switching storage configuration at runtime
 */
export class StorageConfigManager {
  /**
   * Switch to cloud storage with local fallback
   */
  static getCloudConfig(): StorageConfig {
    return {
      type: 'cloud',
      fallbackType: 'local',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000,
    };
  }

  /**
   * Switch to local storage with cloud fallback
   */
  static getLocalConfig(): StorageConfig {
    return {
      type: 'local',
      fallbackType: 'cloud',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      timeout: 5000,
    };
  }

  /**
   * Get offline-only configuration (no fallback)
   */
  static getOfflineConfig(): StorageConfig {
    return {
      type: 'local',
      timeout: 5000,
    };
  }
}

// Example usage in a React component:
/*
export function Dashboard() {
  const [userData, setUserData] = useState(null);
  const userManager = useMemo(() => new UserDataManager(), []);

  useEffect(() => {
    const loadUserData = async () => {
      const userId = await userManager.getCurrentUserId();
      if (userId) {
        const dashboardData = await userManager.getDashboardData(userId);
        setUserData(dashboardData);
      }
    };

    loadUserData().catch(console.error);
  }, [userManager]);

  const handleQuizComplete = async (correctAnswers: number, totalQuestions: number) => {
    const userId = await userManager.getCurrentUserId();
    if (userId) {
      await userManager.updateQuizProgress(userId, correctAnswers, totalQuestions);
      // Reload dashboard data
      const dashboardData = await userManager.getDashboardData(userId);
      setUserData(dashboardData);
    }
  };

  // Component render logic...
}
*/