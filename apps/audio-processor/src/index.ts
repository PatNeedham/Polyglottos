import dotenv from 'dotenv';
// Load environment variables BEFORE importing any other modules
dotenv.config();

import express from 'express';
import cron from 'node-cron';
import { AudioProcessor } from './services/AudioProcessor';
import { AudioStreamer } from './services/AudioStreamer';
import { SpeechToTextService } from './services/SpeechToTextService';
import { PhraseAnalyzer } from './services/PhraseAnalyzer';
import { ApiClient } from './services/ApiClient';
import { logger } from './utils/logger';
import {
  config,
  validateSTTConfiguration,
  getConfiguredSTTServices,
} from './config';

if (!validateSTTConfiguration()) {
  logger.error(
    'No STT service is properly configured. Please set up at least one of:'
  );
  logger.error(
    '- Google Cloud: GOOGLE_CLOUD_STT_API_KEY and GOOGLE_CLOUD_PROJECT_ID'
  );
  logger.error('- Azure: AZURE_STT_API_KEY and AZURE_STT_REGION');
  logger.error(
    '- AWS: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION'
  );
  logger.error('- OpenAI: OPENAI_API_KEY');
  process.exit(1);
}

const configuredServices = getConfiguredSTTServices();
logger.info(`STT services configured: ${configuredServices.join(', ')}`);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const audioStreamer = new AudioStreamer();
const speechToTextService = new SpeechToTextService();
const phraseAnalyzer = new PhraseAnalyzer();
const apiClient = new ApiClient(config.API_BASE_URL);
const audioProcessor = new AudioProcessor(
  audioStreamer,
  speechToTextService,
  phraseAnalyzer,
  apiClient
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Manual trigger endpoint for testing
app.post('/process-audio', async (req, res) => {
  try {
    const { sourceUrl, languageCode } = req.body;

    if (!sourceUrl || !languageCode) {
      return res.status(400).json({
        error: 'sourceUrl and languageCode are required',
      });
    }

    logger.info(`Manual audio processing triggered for ${sourceUrl}`);

    const result = await audioProcessor.processAudioSource(
      sourceUrl,
      languageCode
    );

    return res.json({
      success: true,
      message: 'Audio processing completed',
      data: result,
    });
  } catch (error) {
    logger.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get processing status
app.get('/status/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const status = await apiClient.getAudioContentStatus(contentId);
    res.json(status);
  } catch (error) {
    logger.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schedule automatic processing with configurable interval
const cronExpression = `*/${config.PROCESSING_INTERVAL_MINUTES} * * * *`;
logger.info(
  `Scheduling audio processing every ${config.PROCESSING_INTERVAL_MINUTES} minutes`
);

cron.schedule(cronExpression, async () => {
  logger.info('Starting scheduled audio processing...');

  try {
    // Check API health before processing
    const isAPIHealthy = await apiClient.healthCheck();
    if (!isAPIHealthy) {
      logger.warn('API health check failed, skipping scheduled processing');
      return;
    }

    // Process Danish radio stream
    await audioProcessor.processAudioSource(
      'https://live-icy.dr.dk/A/A03L.mp3',
      'da'
    );

    logger.info('Scheduled audio processing completed');
  } catch (error) {
    logger.error('Error in scheduled processing:', error);
  }
});

app.listen(PORT, () => {
  logger.info(`Audio processor service started on port ${PORT}`);
  logger.info(
    `Scheduled processing will run every ${config.PROCESSING_INTERVAL_MINUTES} minutes`
  );
});
