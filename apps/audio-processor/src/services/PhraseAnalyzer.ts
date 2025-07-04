import { logger } from '../utils/logger';
import { TranscriptionSegment } from './SpeechToTextService';

export interface LearningPhrase {
  originalText: string;
  translatedText: string;
  startTime: number;
  endTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  isUsefulForLearning: boolean;
  tags: string[];
  grammarPoints: string[];
}

export interface PhraseAnalysisResult {
  learningPhrases: LearningPhrase[];
  totalSegments: number;
  usefulSegments: number;
  averageConfidence: number;
}

export class PhraseAnalyzer {
  /**
   * Analyzes transcribed segments and identifies useful phrases for language learning
   * @param segments Array of transcription segments
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code for translation
   * @returns Promise<PhraseAnalysisResult> Analysis results with learning phrases
   */
  async analyzePhrases(
    segments: TranscriptionSegment[],
    sourceLanguage: string,
    targetLanguage: string = 'en'
  ): Promise<PhraseAnalysisResult> {
    logger.info(
      `Analyzing ${segments.length} segments for language learning value`
    );

    const learningPhrases: LearningPhrase[] = [];
    let totalUsefulSegments = 0;
    let totalConfidence = 0;

    for (const segment of segments) {
      const analysis = await this.analyzeSegment(
        segment,
        sourceLanguage,
        targetLanguage
      );

      if (analysis.isUsefulForLearning) {
        learningPhrases.push(analysis);
        totalUsefulSegments++;
      }

      totalConfidence += segment.confidence;
    }

    const averageConfidence =
      segments.length > 0 ? totalConfidence / segments.length : 0;

    return {
      learningPhrases,
      totalSegments: segments.length,
      usefulSegments: totalUsefulSegments,
      averageConfidence,
    };
  }

  /**
   * Analyzes a single segment for learning value
   * @param segment Transcription segment to analyze
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @returns Promise<LearningPhrase> Learning phrase analysis
   */
  private async analyzeSegment(
    segment: TranscriptionSegment,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<LearningPhrase> {
    const text = segment.text.trim();

    // Translate the text (mock implementation)
    const translatedText = await this.translateText(
      text,
      sourceLanguage,
      targetLanguage
    );

    // Determine difficulty based on various factors
    const difficulty = this.determineDifficulty(text, sourceLanguage);

    // Check if the phrase is useful for learning
    const isUsefulForLearning = this.isUsefulForLearning(text, sourceLanguage);

    // Extract tags and grammar points
    const tags = this.extractTags(text, sourceLanguage);
    const grammarPoints = this.extractGrammarPoints(text, sourceLanguage);

    return {
      originalText: text,
      translatedText,
      startTime: segment.startTime,
      endTime: segment.endTime,
      difficulty,
      confidence: segment.confidence,
      isUsefulForLearning,
      tags,
      grammarPoints,
    };
  }

  /**
   * Translates text from source language to target language
   * This is a mock implementation - replace with actual translation service
   * @param text Text to translate
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @returns Promise<string> Translated text
   */
  private async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // MOCK TRANSLATION IMPLEMENTATION
    // Replace with actual translation service integration
    // Examples: Google Translate API, Azure Translator, DeepL API

    /*
    // Example Google Translate API integration:
    const { Translate } = require('@google-cloud/translate').v2;
    const translate = new Translate({
      key: config.TRANSLATION_SERVICE.GOOGLE_TRANSLATE.API_KEY
    });

    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage
    });

    return translation;
    */

    // Mock translations for development
    const mockTranslations: Record<string, Record<string, string>> = {
      da: {
        'God morgen': 'Good morning',
        'og velkommen til nyhederne': 'and welcome to the news',
        'I dag skal vi tale om vejret': 'Today we will talk about the weather',
        'Tak for i dag': 'Thanks for today',
        'Vi ses i morgen': 'See you tomorrow',
      },
      es: {
        'Buenos días': 'Good morning',
        'y bienvenidos a las noticias': 'and welcome to the news',
        'Hoy vamos a hablar del tiempo': 'Today we will talk about the weather',
        'Gracias por hoy': 'Thanks for today',
        'Nos vemos mañana': 'See you tomorrow',
      },
      hi: {
        सुप्रभात: 'Good morning',
        'और समाचार में आपका स्वागत है': 'and welcome to the news',
        'आज हम मौसम के बारे में बात करेंगे':
          'Today we will talk about the weather',
        'आज के लिए धन्यवाद': 'Thanks for today',
        'कल मिलते हैं': 'See you tomorrow',
      },
    };

    return mockTranslations[sourceLanguage]?.[text] || text;
  }

  /**
   * Determines the difficulty level of a phrase
   * @param text Text to analyze
   * @param language Language code
   * @returns Difficulty level
   */
  private determineDifficulty(
    text: string,
    language: string
  ): 'beginner' | 'intermediate' | 'advanced' {
    const wordCount = text.split(/\s+/).length;
    const hasComplexGrammar = this.hasComplexGrammar(text, language);
    const hasRareWords = this.hasRareWords(text, language);

    if (wordCount <= 3 && !hasComplexGrammar && !hasRareWords) {
      return 'beginner';
    }

    if (wordCount <= 7 && !hasComplexGrammar) {
      return 'intermediate';
    }

    return 'advanced';
  }

  /**
   * Checks if a phrase is useful for language learning
   * @param text Text to analyze
   * @param language Language code
   * @returns boolean indicating usefulness
   */
  private isUsefulForLearning(text: string, language: string): boolean {
    // Filter out non-useful content
    const nonUsefulPatterns = [
      /^\s*$/, // Empty or whitespace only
      /^[^a-zA-ZÀ-ÿА-я\u0900-\u097F\u4e00-\u9fff]+$/, // Only punctuation/numbers
      /^(um|uh|hmm|er|ah)$/i, // Filler words
      /^.{1,2}$/, // Very short fragments
    ];

    for (const pattern of nonUsefulPatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }

    // Check for useful characteristics
    const hasCompleteThought = this.hasCompleteThought(text, language);
    const hasUsefulVocabulary = this.hasUsefulVocabulary(text, language);
    const isProperLength = text.length >= 5 && text.length <= 100;

    return hasCompleteThought && hasUsefulVocabulary && isProperLength;
  }

  /**
   * Extracts relevant tags for the phrase
   * @param text Text to analyze
   * @param language Language code
   * @returns Array of tags
   */
  private extractTags(text: string, language: string): string[] {
    const tags: string[] = [];

    // Common phrase types
    if (this.isGreeting(text, language)) tags.push('greeting');
    if (this.isQuestion(text, language)) tags.push('question');
    if (this.isNegation(text, language)) tags.push('negation');
    if (this.hasNumbers(text)) tags.push('numbers');
    if (this.hasTimeReference(text, language)) tags.push('time');
    if (this.hasWeatherTerms(text, language)) tags.push('weather');
    if (this.hasNewsTerms(text, language)) tags.push('news');

    // Difficulty-based tags
    if (this.hasComplexGrammar(text, language)) tags.push('complex-grammar');
    if (this.hasRareWords(text, language)) tags.push('rare-words');

    return tags;
  }

  /**
   * Extracts grammar points from the phrase
   * @param text Text to analyze
   * @param language Language code
   * @returns Array of grammar points
   */
  private extractGrammarPoints(text: string, language: string): string[] {
    const grammarPoints: string[] = [];

    // Language-specific grammar analysis
    switch (language) {
      case 'da':
        if (text.includes('er')) grammarPoints.push('present-tense-verb');
        if (text.includes('skal')) grammarPoints.push('modal-verb');
        if (text.includes('til')) grammarPoints.push('preposition');
        break;
      case 'es':
        if (text.includes('es') || text.includes('está'))
          grammarPoints.push('ser-estar');
        if (text.includes('la') || text.includes('el'))
          grammarPoints.push('definite-article');
        if (text.includes('me') || text.includes('te'))
          grammarPoints.push('pronouns');
        break;
      case 'hi':
        if (text.includes('है')) grammarPoints.push('present-tense');
        if (text.includes('का') || text.includes('की'))
          grammarPoints.push('possessive');
        if (text.includes('में')) grammarPoints.push('postposition');
        break;
    }

    return grammarPoints;
  }

  // Helper methods for phrase analysis
  private hasComplexGrammar(text: string, language: string): boolean {
    const complexPatterns: Record<string, RegExp[]> = {
      da: [/\b(hvis|selvom|fordi|mens)\b/i],
      es: [/\b(aunque|porque|mientras|desde)\b/i],
      hi: [/\b(क्योंकि|जब|यदि|तब)\b/i],
      en: [/\b(although|because|while|since)\b/i],
    };

    return (
      complexPatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }

  private hasRareWords(text: string, language: string): boolean {
    // This would typically use a frequency dictionary
    // For now, use simple heuristics
    return text.split(/\s+/).length > 5;
  }

  private hasCompleteThought(text: string, language: string): boolean {
    // Check for complete sentences or meaningful phrases
    return (
      text.trim().length > 4 &&
      (text.includes(' ') || // Multi-word phrase
        /[.!?]$/.test(text) || // Ends with punctuation
        this.isGreeting(text, language)) // Common greetings
    );
  }

  private hasUsefulVocabulary(text: string, language: string): boolean {
    // Check for common, useful vocabulary
    const usefulPatterns: Record<string, RegExp[]> = {
      da: [/\b(god|morgen|dag|tak|hej|farvel)\b/i],
      es: [/\b(bueno|día|gracias|hola|adiós)\b/i],
      hi: [/\b(अच्छा|दिन|धन्यवाद|नमस्ते)\b/i],
      en: [/\b(good|day|thanks|hello|goodbye)\b/i],
    };

    return (
      usefulPatterns[language]?.some((pattern) => pattern.test(text)) || true
    );
  }

  private isGreeting(text: string, language: string): boolean {
    const greetingPatterns: Record<string, RegExp[]> = {
      da: [/\b(god morgen|hej|farvel)\b/i],
      es: [/\b(buenos días|hola|adiós)\b/i],
      hi: [/\b(नमस्ते|सुप्रभात|अलविदा)\b/i],
      en: [/\b(good morning|hello|goodbye)\b/i],
    };

    return (
      greetingPatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }

  private isQuestion(text: string, language: string): boolean {
    return text.includes('?') || /^(what|how|where|when|why|who)/i.test(text);
  }

  private isNegation(text: string, language: string): boolean {
    const negationPatterns: Record<string, RegExp[]> = {
      da: [/\b(ikke|nej|ingen)\b/i],
      es: [/\b(no|nada|nunca)\b/i],
      hi: [/\b(नहीं|नहीं|कभी नहीं)\b/i],
      en: [/\b(not|no|never)\b/i],
    };

    return (
      negationPatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }

  private hasNumbers(text: string): boolean {
    return /\d/.test(text);
  }

  private hasTimeReference(text: string, language: string): boolean {
    const timePatterns: Record<string, RegExp[]> = {
      da: [/\b(i dag|i morgen|i går|tid|time)\b/i],
      es: [/\b(hoy|mañana|ayer|tiempo|hora)\b/i],
      hi: [/\b(आज|कल|समय|घंटा)\b/i],
      en: [/\b(today|tomorrow|yesterday|time|hour)\b/i],
    };

    return (
      timePatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }

  private hasWeatherTerms(text: string, language: string): boolean {
    const weatherPatterns: Record<string, RegExp[]> = {
      da: [/\b(vejr|sol|regn|sne|vind)\b/i],
      es: [/\b(tiempo|sol|lluvia|nieve|viento)\b/i],
      hi: [/\b(मौसम|धूप|बारिश|बर्फ|हवा)\b/i],
      en: [/\b(weather|sun|rain|snow|wind)\b/i],
    };

    return (
      weatherPatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }

  private hasNewsTerms(text: string, language: string): boolean {
    const newsPatterns: Record<string, RegExp[]> = {
      da: [/\b(nyheder|nyhed|rapport|information)\b/i],
      es: [/\b(noticias|noticia|informe|información)\b/i],
      hi: [/\b(समाचार|खबर|रिपोर्ट|जानकारी)\b/i],
      en: [/\b(news|report|information|update)\b/i],
    };

    return (
      newsPatterns[language]?.some((pattern) => pattern.test(text)) || false
    );
  }
}
