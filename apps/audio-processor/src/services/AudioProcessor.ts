import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config';
import { AudioStreamer, AudioStreamResult } from './AudioStreamer';
import { SpeechToTextService } from './SpeechToTextService';
import { PhraseAnalyzer, PhraseAnalysisResult } from './PhraseAnalyzer';
import { ApiClient, AudioContentData, AudioSegmentData } from './ApiClient';

export interface ProcessingResult {
  audioContentId: number;
  segmentIds: number[];
  quizIds: number[];
  processingTime: number;
  success: boolean;
  error?: string;
}

export class AudioProcessor {
  private retryCount = 0;

  constructor(
    private audioStreamer: AudioStreamer,
    private speechToTextService: SpeechToTextService,
    private phraseAnalyzer: PhraseAnalyzer,
    private apiClient: ApiClient
  ) {}

  /**
   * Main processing function that handles the entire audio processing pipeline
   * @param sourceUrl URL of the audio source (e.g., live stream)
   * @param languageCode Language code for the audio content
   * @returns Promise<ProcessingResult> Result of the processing operation
   */
  async processAudioSource(
    sourceUrl: string,
    languageCode: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    let audioContentId: number | null = null;

    try {
      logger.info(
        `Starting audio processing for ${sourceUrl} (${languageCode})`
      );

      // Step 1: Capture audio segment from the stream
      logger.info('Step 1: Capturing audio segment...');
      const audioResult = await this.captureAudioWithRetry(sourceUrl);

      // Validate audio content before proceeding
      if (!audioResult.isValidAudio) {
        throw new Error(
          `Captured audio appears to be silent or invalid (level: ${audioResult.audioLevel})`
        );
      }

      logger.info(
        `Audio validation passed - level: ${audioResult.audioLevel.toFixed(3)}`
      );

      // Step 2: Upload audio file to API
      logger.info('Step 2: Uploading audio file...');
      const audioUrl = await this.uploadAudioFile(audioResult.audioPath);

      // Step 3: Get language ID
      logger.info('Step 3: Getting language ID...');
      const languageId = await this.apiClient.getLanguageId(languageCode);

      // Step 4: Create initial audio content record
      logger.info('Step 4: Creating audio content record...');
      const audioContentData: AudioContentData = {
        languageId,
        title: `Audio Segment ${new Date().toISOString()}`,
        audioUrl,
        duration: audioResult.duration,
        transcript: '', // Will be updated after transcription
        source: this.extractSourceName(sourceUrl),
        sourceUrl,
        difficulty: 'intermediate',
        processingStatus: 'processing',
      };

      audioContentId = await this.apiClient.storeAudioContent(audioContentData);

      // Step 5: Transcribe audio
      logger.info('Step 5: Transcribing audio...');
      const transcription = await this.speechToTextService.transcribeAudio(
        audioResult.audioPath,
        languageCode
      );

      // Step 6: Analyze phrases for learning value
      logger.info('Step 6: Analyzing phrases...');
      const phraseAnalysis = await this.phraseAnalyzer.analyzePhrases(
        transcription.segments,
        languageCode,
        'en' // Default target language for translations
      );

      // Step 7: Store audio segments
      logger.info('Step 7: Storing audio segments...');
      const segmentData: AudioSegmentData[] =
        phraseAnalysis.learningPhrases.map((phrase) => ({
          audioContentId: audioContentId!,
          startTime: phrase.startTime,
          endTime: phrase.endTime,
          text: phrase.originalText,
          translatedText: phrase.translatedText,
          confidence: phrase.confidence,
          difficulty: phrase.difficulty,
          isUsefulForLearning: phrase.isUsefulForLearning,
        }));

      const segmentIds = await this.apiClient.storeAudioSegments(segmentData);

      // Step 8: Create quizzes from useful phrases
      logger.info('Step 8: Creating quizzes...');
      const quizData = await this.apiClient.createListeningQuizzes(
        phraseAnalysis.learningPhrases,
        languageId
      );

      // Add segment IDs to quiz data
      const quizDataWithSegments = quizData.map((quiz, index) => ({
        ...quiz,
        audioSegmentId: segmentIds[Math.floor(index / 2)], // Each segment creates 2 quizzes
      }));

      const quizIds = await this.apiClient.createQuizzes(quizDataWithSegments);

      // Step 9: Update processing status
      logger.info('Step 9: Updating processing status...');
      await this.apiClient.updateProcessingStatus(audioContentId, 'completed');

      // Step 10: Cleanup temporary files
      logger.info('Step 10: Cleaning up temporary files...');
      await this.audioStreamer.cleanupOldFiles(30); // Clean files older than 30 minutes

      const processingTime = Date.now() - startTime;

      logger.info(
        `Audio processing completed successfully in ${processingTime}ms`
      );
      logger.info(
        `Created ${segmentIds.length} segments and ${quizIds.length} quizzes`
      );

      return {
        audioContentId,
        segmentIds,
        quizIds,
        processingTime,
        success: true,
      };
    } catch (error) {
      logger.error('Audio processing failed:', error);

      // Update processing status to failed if we have an audio content ID
      if (audioContentId) {
        try {
          await this.apiClient.updateProcessingStatus(audioContentId, 'failed');
        } catch (updateError) {
          logger.error('Failed to update processing status:', updateError);
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        audioContentId: audioContentId || -1,
        segmentIds: [],
        quizIds: [],
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Captures audio with retry logic
   * @param sourceUrl URL of the audio source
   * @returns Promise<AudioStreamResult> Audio capture result
   */
  private async captureAudioWithRetry(
    sourceUrl: string
  ): Promise<AudioStreamResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
      try {
        logger.info(`Audio capture attempt ${attempt}/${config.MAX_RETRIES}`);
        return await this.audioStreamer.captureAudioSegment(sourceUrl);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        logger.warn(
          `Audio capture attempt ${attempt} failed: ${lastError.message}`
        );

        if (attempt < config.MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.info(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Audio capture failed after all retries');
  }

  /**
   * Uploads audio file to the API
   * @param audioPath Path to the audio file
   * @returns Promise<string> URL of the uploaded file
   */
  private async uploadAudioFile(audioPath: string): Promise<string> {
    const fileName = path.basename(audioPath);
    return await this.apiClient.uploadAudioFile(audioPath, fileName);
  }

  /**
   * Extracts source name from URL
   * @param url Source URL
   * @returns Source name
   */
  private extractSourceName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Sleep utility function
   * @param ms Milliseconds to sleep
   * @returns Promise<void>
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validates processing configuration
   * @param languageCode Language code to validate
   * @returns boolean True if configuration is valid
   */
  private validateConfiguration(languageCode: string): boolean {
    if (!config.SUPPORTED_LANGUAGES.includes(languageCode)) {
      logger.error(`Unsupported language: ${languageCode}`);
      return false;
    }

    if (!config.AUDIO_STORAGE_PATH) {
      logger.error('AUDIO_STORAGE_PATH not configured');
      return false;
    }

    return true;
  }

  /**
   * Gets processing statistics
   * @returns Object with processing statistics
   */
  async getProcessingStats(): Promise<{
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
  }> {
    // This would typically query the database for statistics
    // For now, return mock data
    return {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
    };
  }
}
