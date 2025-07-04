export const config = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8787',
  AUDIO_STORAGE_PATH: process.env.AUDIO_STORAGE_PATH || './audio_storage',
  SEGMENT_DURATION: 15, // seconds
  MAX_RETRIES: 3,
  SUPPORTED_LANGUAGES: ['da', 'en', 'es', 'hi'],
  PROCESSING_INTERVAL_MINUTES: parseInt(
    process.env.PROCESSING_INTERVAL_MINUTES || '5',
    10
  ),
  AUDIO_FORMAT: process.env.AUDIO_FORMAT || 'wav', // 'wav' or 'mp3'

  // Speech-to-text service configuration
  STT_SERVICE: {
    // Placeholder for various STT service configurations
    // In production, you would choose one of these services
    GOOGLE_CLOUD: {
      API_KEY: process.env.GOOGLE_CLOUD_STT_API_KEY,
      PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    },
    AZURE: {
      API_KEY: process.env.AZURE_STT_API_KEY,
      REGION: process.env.AZURE_STT_REGION,
    },
    AWS: {
      ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      REGION: process.env.AWS_REGION,
    },
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY,
    },
  },

  // Translation service configuration
  TRANSLATION_SERVICE: {
    GOOGLE_TRANSLATE: {
      API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
    },
    AZURE_TRANSLATE: {
      API_KEY: process.env.AZURE_TRANSLATE_API_KEY,
      REGION: process.env.AZURE_TRANSLATE_REGION,
    },
  },
};

/**
 * Validates that at least one STT service is configured
 * @returns boolean True if at least one STT service is configured
 */
export function validateSTTConfiguration(): boolean {
  const sttServices = config.STT_SERVICE;

  const hasGoogleCloud =
    sttServices.GOOGLE_CLOUD.API_KEY && sttServices.GOOGLE_CLOUD.PROJECT_ID;
  const hasAzure = sttServices.AZURE.API_KEY && sttServices.AZURE.REGION;
  const hasAWS =
    sttServices.AWS.ACCESS_KEY_ID &&
    sttServices.AWS.SECRET_ACCESS_KEY &&
    sttServices.AWS.REGION;
  const hasOpenAI = sttServices.OPENAI.API_KEY;

  return !!(hasGoogleCloud || hasAzure || hasAWS || hasOpenAI);
}

/**
 * Gets the list of configured STT services
 * @returns string[] Array of configured STT service names
 */
export function getConfiguredSTTServices(): string[] {
  const sttServices = config.STT_SERVICE;
  const configured: string[] = [];

  if (sttServices.GOOGLE_CLOUD.API_KEY && sttServices.GOOGLE_CLOUD.PROJECT_ID) {
    configured.push('Google Cloud Speech-to-Text');
  }
  if (sttServices.AZURE.API_KEY && sttServices.AZURE.REGION) {
    configured.push('Azure Speech Service');
  }
  if (
    sttServices.AWS.ACCESS_KEY_ID &&
    sttServices.AWS.SECRET_ACCESS_KEY &&
    sttServices.AWS.REGION
  ) {
    configured.push('AWS Transcribe');
  }
  if (sttServices.OPENAI.API_KEY) {
    configured.push('OpenAI Whisper');
  }

  return configured;
}
