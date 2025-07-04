import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface AudioStreamResult {
  audioPath: string;
  duration: number;
  format: string;
  sampleRate: number;
  isValidAudio: boolean;
  audioLevel: number; // Peak audio level (0-1)
}

export class AudioStreamer {
  private ensureStorageDir(): void {
    fs.ensureDirSync(config.AUDIO_STORAGE_PATH);
  }

  /**
   * Captures a 15-second audio segment from a live stream
   * @param streamUrl The URL of the live audio stream
   * @returns Promise<AudioStreamResult> Information about the captured audio
   */
  async captureAudioSegment(streamUrl: string): Promise<AudioStreamResult> {
    this.ensureStorageDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = config.AUDIO_FORMAT === 'mp3' ? 'mp3' : 'wav';
    const filename = `audio_${timestamp}.${fileExtension}`;
    const outputPath = path.join(config.AUDIO_STORAGE_PATH, filename);

    logger.info(`Starting audio capture from ${streamUrl}`);

    return new Promise((resolve, reject) => {
      const outputOptions = [
        '-t',
        config.SEGMENT_DURATION.toString(), // Duration limit
        '-ar',
        '16000', // Sample rate suitable for STT
        '-ac',
        '1', // Mono channel
      ];

      // Configure output format based on user preference
      if (config.AUDIO_FORMAT === 'mp3') {
        outputOptions.push(
          '-f',
          'mp3',
          '-acodec',
          'libmp3lame',
          '-b:a',
          '128k'
        );
      } else {
        outputOptions.push('-f', 'wav', '-acodec', 'pcm_s16le');
      }

      const command = ffmpeg()
        .input(streamUrl)
        .inputOptions([
          '-f',
          'mp3', // Input format
          '-re', // Read input at its native frame rate
          '-timeout',
          '30000000', // 30 second timeout for connection
        ])
        .outputOptions(outputOptions)
        .output(outputPath)
        .on('start', (commandLine) => {
          logger.info(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Processing: ${progress.percent}% done`);
        })
        .on('end', async () => {
          logger.info(`Audio capture completed: ${outputPath}`);

          try {
            // Validate the captured audio
            const validation = await this.validateAudioContent(outputPath);

            resolve({
              audioPath: outputPath,
              duration: config.SEGMENT_DURATION,
              format: config.AUDIO_FORMAT,
              sampleRate: 16000,
              isValidAudio: validation.isValid,
              audioLevel: validation.audioLevel,
            });
          } catch (error) {
            reject(
              new Error(
                `Failed to validate audio: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              )
            );
          }
        })
        .on('error', (error) => {
          logger.error(`FFmpeg error: ${error.message}`);
          reject(new Error(`Audio capture failed: ${error.message}`));
        });

      // Start the capture process
      command.run();
    });
  }

  /**
   * Converts audio to format suitable for speech-to-text processing
   * @param inputPath Path to the input audio file
   * @returns Promise<string> Path to the converted audio file
   */
  async convertForSTT(inputPath: string): Promise<string> {
    const outputPath = inputPath.replace(/\.[^/.]+$/, '_stt.wav');

    logger.info(`Converting audio for STT: ${inputPath} -> ${outputPath}`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-f',
          'wav',
          '-acodec',
          'pcm_s16le',
          '-ar',
          '16000',
          '-ac',
          '1',
        ])
        .output(outputPath)
        .on('end', () => {
          logger.info(`Audio conversion completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          logger.error(`Audio conversion error: ${error.message}`);
          reject(new Error(`Audio conversion failed: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Validates audio content to ensure it's not silent or just noise
   * @param audioPath Path to the audio file to validate
   * @returns Promise<{isValid: boolean, audioLevel: number}> Validation result
   */
  async validateAudioContent(
    audioPath: string
  ): Promise<{ isValid: boolean; audioLevel: number }> {
    return new Promise((resolve, reject) => {
      let maxAudioLevel = 0;
      let hasAudioData = false;

      ffmpeg(audioPath)
        .audioFilter('volumedetect')
        .format('null')
        .output('-')
        .on('stderr', (stderrLine) => {
          // Parse volume detection output
          if (stderrLine.includes('max_volume:')) {
            const match = stderrLine.match(/max_volume:\s*(-?\d+\.?\d*)\s*dB/);
            if (match && match[1]) {
              const maxVolumeDb = parseFloat(match[1]);
              // Convert dB to linear scale (approximate)
              maxAudioLevel = Math.pow(10, maxVolumeDb / 20);
              hasAudioData = true;
            }
          }
        })
        .on('end', () => {
          // Consider audio valid if it has a reasonable audio level
          // -60dB (0.001 linear) is typically the threshold for meaningful audio
          const isValid = hasAudioData && maxAudioLevel > 0.001;

          if (!isValid) {
            logger.warn(
              `Audio validation failed: max audio level ${maxAudioLevel} (${
                20 * Math.log10(maxAudioLevel)
              }dB)`
            );
          } else {
            logger.info(
              `Audio validation passed: max audio level ${maxAudioLevel} (${
                20 * Math.log10(maxAudioLevel)
              }dB)`
            );
          }

          resolve({
            isValid,
            audioLevel: Math.min(maxAudioLevel, 1.0), // Cap at 1.0
          });
        })
        .on('error', (error) => {
          logger.error(`Audio validation error: ${error.message}`);
          // If validation fails, assume audio is valid to avoid blocking processing
          resolve({
            isValid: true,
            audioLevel: 0.5, // Default moderate level
          });
        })
        .run();
    });
  }

  /**
   * Cleans up old audio files to prevent storage buildup
   * @param maxAgeMinutes Maximum age of files to keep (default: 60 minutes)
   */
  async cleanupOldFiles(maxAgeMinutes: number = 60): Promise<void> {
    try {
      const files = await fs.readdir(config.AUDIO_STORAGE_PATH);
      const now = Date.now();
      const maxAgeMs = maxAgeMinutes * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(config.AUDIO_STORAGE_PATH, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fs.remove(filePath);
          logger.info(`Cleaned up old audio file: ${file}`);
        }
      }
    } catch (error) {
      logger.error(`Error cleaning up old files: ${error}`);
    }
  }
}
