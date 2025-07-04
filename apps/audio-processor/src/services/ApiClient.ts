import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { LearningPhrase } from './PhraseAnalyzer';

export interface AudioContentData {
  languageId: number;
  title: string;
  audioUrl: string;
  duration: number;
  transcript: string;
  source: string;
  sourceUrl: string;
  difficulty: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AudioSegmentData {
  audioContentId: number;
  startTime: number;
  endTime: number;
  text: string;
  translatedText: string;
  confidence: number;
  difficulty: string;
  isUsefulForLearning: boolean;
}

export interface QuizData {
  quizType: 'listening' | 'translation' | 'multiple_choice';
  languageId: number;
  content: string;
  answer: string;
  audioSegmentId?: number;
  difficulty: string;
  hints?: string;
}

export class ApiClient {
  private axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axios.interceptors.request.use(
      (config) => {
        logger.info(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
        logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          logger.error(
            `API server is not running on ${baseURL}. Please start the API server first.`
          );
          error.message = `Connection refused: API server not running on ${baseURL}`;
        } else if (error.code === 'ENOTFOUND') {
          logger.error(`API server hostname could not be resolved: ${baseURL}`);
          error.message = `Hostname not found: ${baseURL}`;
        } else if (error.code === 'ETIMEDOUT') {
          logger.error(`Request to API server timed out: ${baseURL}`);
          error.message = `Request timeout: ${baseURL}`;
        } else {
          logger.error(
            'API Response Error:',
            error.response?.data || error.message
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Stores audio content in the database
   * @param audioData Audio content data
   * @returns Promise<number> ID of the created audio content
   */
  async storeAudioContent(audioData: AudioContentData): Promise<number> {
    try {
      const response = await this.axios.post('/api/audio-content', audioData);
      logger.info(`Audio content stored with ID: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      logger.error('Failed to store audio content:', error);
      throw new Error('Failed to store audio content');
    }
  }

  /**
   * Stores audio segments in the database
   * @param segments Array of audio segment data
   * @returns Promise<number[]> Array of created segment IDs
   */
  async storeAudioSegments(segments: AudioSegmentData[]): Promise<number[]> {
    try {
      const response = await this.axios.post('/api/audio-segments', {
        segments,
      });
      logger.info(`Stored ${segments.length} audio segments`);
      return response.data.ids;
    } catch (error) {
      logger.error('Failed to store audio segments:', error);
      throw new Error('Failed to store audio segments');
    }
  }

  /**
   * Creates quizzes from learning phrases
   * @param quizzes Array of quiz data
   * @returns Promise<number[]> Array of created quiz IDs
   */
  async createQuizzes(quizzes: QuizData[]): Promise<number[]> {
    try {
      const response = await this.axios.post('/api/quizzes', { quizzes });
      logger.info(`Created ${quizzes.length} quizzes`);
      return response.data.ids;
    } catch (error) {
      logger.error('Failed to create quizzes:', error);
      throw new Error('Failed to create quizzes');
    }
  }

  /**
   * Gets the language ID by language code
   * @param languageCode Language code (e.g., 'da', 'en', 'es', 'hi')
   * @returns Promise<number> Language ID
   */
  async getLanguageId(languageCode: string): Promise<number> {
    try {
      const response = await this.axios.get(
        `/api/languages?code=${languageCode}`
      );

      if (!response.data || !response.data.id) {
        throw new Error(`Language not found: ${languageCode}`);
      }

      return response.data.id;
    } catch (error) {
      logger.error(`Failed to get language ID for ${languageCode}:`, error);
      throw new Error(`Failed to get language ID for ${languageCode}`);
    }
  }

  /**
   * Updates the processing status of audio content
   * @param contentId Audio content ID
   * @param status New processing status
   * @returns Promise<void>
   */
  async updateProcessingStatus(
    contentId: number,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    try {
      await this.axios.patch(`/api/audio-content/${contentId}/status`, {
        status,
      });
      logger.info(
        `Updated processing status for content ${contentId}: ${status}`
      );
    } catch (error) {
      logger.error(
        `Failed to update processing status for content ${contentId}:`,
        error
      );
      throw new Error(`Failed to update processing status`);
    }
  }

  /**
   * Gets the processing status of audio content
   * @param contentId Audio content ID
   * @returns Promise<object> Status information
   */
  async getAudioContentStatus(contentId: string): Promise<object> {
    try {
      const response = await this.axios.get(
        `/api/audio-content/${contentId}/status`
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get processing status for content ${contentId}:`,
        error
      );
      throw new Error(`Failed to get processing status`);
    }
  }

  /**
   * Uploads audio file to the API
   * @param filePath Path to the audio file
   * @param fileName Name for the uploaded file
   * @returns Promise<string> URL to the uploaded file
   */
  async uploadAudioFile(filePath: string, fileName: string): Promise<string> {
    try {
      const fs = require('fs');
      const FormData = require('form-data');

      const form = new FormData();
      form.append('audio', fs.createReadStream(filePath), fileName);

      const response = await this.axios.post('/api/upload/audio', form, {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: 100 * 1024 * 1024, // 100MB
      });

      logger.info(`Audio file uploaded: ${response.data.url}`);
      return response.data.url;
    } catch (error) {
      logger.error('Failed to upload audio file:', error);
      throw new Error('Failed to upload audio file');
    }
  }

  /**
   * Creates listening quizzes from learning phrases
   * @param learningPhrases Array of learning phrases
   * @param languageId Language ID
   * @returns Promise<QuizData[]> Array of quiz data
   */
  async createListeningQuizzes(
    learningPhrases: LearningPhrase[],
    languageId: number
  ): Promise<QuizData[]> {
    const quizzes: QuizData[] = [];

    for (const phrase of learningPhrases) {
      if (phrase.isUsefulForLearning) {
        // Create listening quiz
        quizzes.push({
          quizType: 'listening',
          languageId,
          content: 'Listen to the audio and type what you hear.',
          answer: phrase.originalText,
          difficulty: phrase.difficulty,
          hints: JSON.stringify([
            'Listen carefully to the pronunciation',
            `This phrase means: "${phrase.translatedText}"`,
          ]),
        });

        // Create translation quiz
        quizzes.push({
          quizType: 'translation',
          languageId,
          content: `Translate to English: "${phrase.originalText}"`,
          answer: phrase.translatedText,
          difficulty: phrase.difficulty,
          hints: JSON.stringify([
            'Think about the context',
            `Tags: ${phrase.tags.join(', ')}`,
          ]),
        });
      }
    }

    return quizzes;
  }

  /**
   * Health check for the API
   * @returns Promise<boolean> True if API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axios.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('API health check failed:', error);
      return false;
    }
  }
}
