# Audio Processor

A standalone service for processing audio streams and extracting language learning content for the Polyglottos platform.

## Features

- **Audio Stream Capture**: Captures 15-second segments from live audio streams (configurable interval)
- **Audio Validation**: Ensures captured audio is not silent or just background noise
- **Multiple Output Formats**: Supports both WAV and MP3 output formats
- **Speech-to-Text**: Transcribes audio with timestamp information using multiple STT providers
- **Phrase Analysis**: Identifies useful phrases for language learning
- **Translation**: Provides translations for educational content
- **Quiz Generation**: Creates listening and translation quizzes automatically
- **API Integration**: Stores processed content in the main Polyglottos database
- **Error Handling**: Comprehensive error handling and retry logic

## Architecture

The audio processor follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  AudioStreamer  │────│ SpeechToTextService │────│  PhraseAnalyzer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ AudioProcessor  │ (Main orchestrator)
                    └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   ApiClient     │
                        └─────────────────┘
```

## Services

### AudioStreamer
- Captures audio segments from live streams using FFmpeg
- Supports multiple output formats (WAV, MP3)
- Validates audio content to ensure it's not silent
- Converts audio to optimal format for speech-to-text processing
- Manages temporary file storage and cleanup

### SpeechToTextService
- Integrates with third-party STT services (Google Cloud, Azure, AWS, OpenAI)
- Provides timestamped transcriptions
- Handles multiple languages

### PhraseAnalyzer
- Analyzes transcribed text for learning value
- Extracts grammar points and tags
- Determines difficulty levels
- Identifies useful phrases for language learning

### ApiClient
- Communicates with the main Polyglottos API
- Stores audio content, segments, and generated quizzes
- Handles file uploads and status updates

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Install FFmpeg** (required for audio processing):
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu**: `apt-get install ffmpeg`
   - **Docker**: Already included in the Dockerfile

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the service**:
   ```bash
   npm start
   ```

## Development

```bash
# Start in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Docker Deployment

```bash
# Build the Docker image
docker build -t polyglottos-audio-processor .

# Run the container
docker run -d \
  --name audio-processor \
  -p 3001:3001 \
  -e API_BASE_URL=http://api:8787 \
  -e OPENAI_API_KEY=your_key \
  -v audio_data:/app/audio_storage \
  polyglottos-audio-processor
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Manual Processing
```
POST /process-audio
Content-Type: application/json

{
  "sourceUrl": "https://live-icy.dr.dk/A/A03L.mp3",
  "languageCode": "da"
}
```
Manually triggers audio processing for testing.

### Processing Status
```
GET /status/:contentId
```
Returns processing status for specific audio content.

## Configuration

### Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Service port (default: 3001)
- `API_BASE_URL`: URL of the main Polyglottos API
- `AUDIO_STORAGE_PATH`: Path for temporary audio files
- `PROCESSING_INTERVAL_MINUTES`: How often to process audio (default: 5 minutes)
- `AUDIO_FORMAT`: Output format for captured audio (wav or mp3, default: wav)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

### Speech-to-Text Services

Choose one of the following STT services and configure accordingly:

#### Google Cloud Speech-to-Text
```env
GOOGLE_CLOUD_STT_API_KEY=your_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

#### Azure Speech Services
```env
AZURE_STT_API_KEY=your_api_key
AZURE_STT_REGION=your_region
```

#### OpenAI Whisper API
```env
OPENAI_API_KEY=your_api_key
```

### Translation Services

#### Google Translate
```env
GOOGLE_TRANSLATE_API_KEY=your_api_key
```

#### Azure Translator
```env
AZURE_TRANSLATE_API_KEY=your_api_key
AZURE_TRANSLATE_REGION=your_region
```

## Supported Languages

- Danish (da)
- English (en)
- Spanish (es)
- Hindi (hi)

## Processing Pipeline

1. **Audio Capture**: Capture 15-second segment from live stream
2. **Audio Validation**: Ensure audio is not silent or just background noise
3. **File Upload**: Upload audio file to main API for storage
4. **Transcription**: Convert speech to text with timestamps
5. **Analysis**: Analyze text for learning value and extract phrases
6. **Translation**: Translate useful phrases to target language
7. **Storage**: Store audio segments and metadata in database
8. **Quiz Generation**: Create listening and translation quizzes
9. **Cleanup**: Remove temporary files

## Monitoring

The service includes comprehensive logging and health checks:

- Health endpoint for service monitoring
- Structured JSON logging with Winston
- Processing metrics and error tracking
- Automatic retry logic for failed operations

## Production Considerations

- Configure appropriate STT and translation service API keys
- Set up proper logging aggregation
- Monitor disk space for audio storage
- Configure rate limiting for API calls
- Set up alerts for processing failures
- Consider horizontal scaling for high-volume processing

## Integration with Main API

The audio processor is designed to work independently but integrates closely with the main Polyglottos API:

- Stores processed content in the main database
- Uploads audio files through the main API
- Creates quizzes and learning content
- Updates processing status for monitoring

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg on your system
2. **API connection failed**: Check API_BASE_URL and ensure the API server is running
3. **STT service errors**: Verify API keys and service quotas - at least one STT service must be configured
4. **Storage issues**: Check disk space and permissions for AUDIO_STORAGE_PATH
5. **Silent audio**: If audio validation fails, check the audio source and stream quality
6. **No STT service configured**: App will exit with error - configure at least one STT API key

### Logs

Check the application logs for detailed error information:
- `error.log`: Error-level logs
- `combined.log`: All logs
- Console output in development mode