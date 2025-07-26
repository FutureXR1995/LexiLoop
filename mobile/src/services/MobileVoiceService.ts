/**
 * Mobile Voice Service
 * Optimized voice functionality for React Native
 */

import { Platform } from 'react-native';
import Voice, { SpeechRecognizedEvent, SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Sound from 'react-native-sound';
import { MMKV } from 'react-native-mmkv';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Initialize MMKV for fast storage
const storage = new MMKV();

export interface VoiceRecognitionOptions {
  language?: string;
  timeout?: number;
  partialResults?: boolean;
  continuous?: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

class MobileVoiceService {
  private isListening: boolean = false;
  private isInitialized: boolean = false;
  private currentSound: Sound | null = null;
  private recognitionTimeout: NodeJS.Timeout | null = null;

  // Callbacks
  private onSpeechStart?: () => void;
  private onSpeechResult?: (result: VoiceRecognitionResult) => void;
  private onSpeechEnd?: () => void;
  private onSpeechError?: (error: string) => void;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Enable high quality audio
      Sound.setCategory('Playback');
      
      // Initialize Voice recognition
      Voice.onSpeechStart = this.handleSpeechStart.bind(this);
      Voice.onSpeechRecognized = this.handleSpeechRecognized.bind(this);
      Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
      Voice.onSpeechError = this.handleSpeechError.bind(this);
      Voice.onSpeechResults = this.handleSpeechResults.bind(this);
      Voice.onSpeechPartialResults = this.handleSpeechPartialResults.bind(this);

      this.isInitialized = true;
      console.log('MobileVoiceService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MobileVoiceService:', error);
    }
  }

  /**
   * Text-to-Speech functionality
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any current playback
        this.stopSpeaking();

        if (Platform.OS === 'ios') {
          // Use iOS Speech Synthesis
          this.speakIOS(text, options, resolve, reject);
        } else {
          // Use Android Text-to-Speech
          this.speakAndroid(text, options, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private speakIOS(text: string, options: TTSOptions, resolve: () => void, reject: (error: any) => void) {
    // iOS implementation using AVSpeechSynthesizer (would need native module)
    // For now, using sound files as fallback
    this.playTextAudio(text, resolve, reject);
  }

  private speakAndroid(text: string, options: TTSOptions, resolve: () => void, reject: (error: any) => void) {
    // Android implementation using TextToSpeech (would need native module)
    // For now, using sound files as fallback
    this.playTextAudio(text, resolve, reject);
  }

  private playTextAudio(text: string, resolve: () => void, reject: (error: any) => void) {
    // Check if we have cached audio for this text
    const cachedAudioPath = storage.getString(`audio_${text}`);
    
    if (cachedAudioPath) {
      this.playAudioFile(cachedAudioPath, resolve, reject);
    } else {
      // Generate audio from backend service
      this.generateAndPlayAudio(text, resolve, reject);
    }
  }

  private playAudioFile(audioPath: string, resolve: () => void, reject: (error: any) => void) {
    const sound = new Sound(audioPath, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load sound:', error);
        reject(error);
        return;
      }

      this.currentSound = sound;
      sound.play((success) => {
        if (success) {
          console.log('Audio playback completed');
          resolve();
        } else {
          console.error('Audio playback failed');
          reject(new Error('Audio playback failed'));
        }
        sound.release();
        this.currentSound = null;
      });
    });
  }

  private async generateAndPlayAudio(text: string, resolve: () => void, reject: (error: any) => void) {
    try {
      // This would call your backend AI service to generate audio
      // For now, we'll use a placeholder
      console.log(`Generating audio for: ${text}`);
      
      // Provide haptic feedback
      ReactNativeHapticFeedback.trigger('impactLight');
      
      // Simulate audio generation delay
      setTimeout(() => {
        console.log('Audio generation completed (simulated)');
        resolve();
      }, 1000);
    } catch (error) {
      reject(error);
    }
  }

  stopSpeaking(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  /**
   * Speech Recognition functionality
   */
  async startListening(options: VoiceRecognitionOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Voice service not initialized');
    }

    if (this.isListening) {
      throw new Error('Already listening');
    }

    try {
      // Provide haptic feedback
      ReactNativeHapticFeedback.trigger('impactMedium');

      const voiceOptions = {
        language: options.language || 'en-US',
        partialResults: options.partialResults ?? true,
        continuous: options.continuous ?? false,
      };

      await Voice.start(voiceOptions.language, voiceOptions);
      this.isListening = true;

      // Set timeout if specified
      if (options.timeout) {
        this.recognitionTimeout = setTimeout(() => {
          this.stopListening();
        }, options.timeout);
      }

      console.log('Voice recognition started');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      await Voice.stop();
      this.isListening = false;

      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }

      // Provide haptic feedback
      ReactNativeHapticFeedback.trigger('impactLight');

      console.log('Voice recognition stopped');
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  /**
   * Voice Recognition Event Handlers
   */
  private handleSpeechStart() {
    console.log('Speech recognition started');
    if (this.onSpeechStart) {
      this.onSpeechStart();
    }
  }

  private handleSpeechRecognized() {
    console.log('Speech recognized');
  }

  private handleSpeechEnd() {
    console.log('Speech recognition ended');
    this.isListening = false;
    
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }

    if (this.onSpeechEnd) {
      this.onSpeechEnd();
    }
  }

  private handleSpeechError(event: SpeechErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;

    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }

    if (this.onSpeechError) {
      this.onSpeechError(event.error?.message || 'Speech recognition error');
    }
  }

  private handleSpeechResults(event: SpeechResultsEvent) {
    if (event.value && event.value.length > 0) {
      const result: VoiceRecognitionResult = {
        transcript: event.value[0],
        confidence: 1.0, // Voice library doesn't provide confidence scores
        isFinal: true,
      };

      console.log('Speech result:', result.transcript);
      
      if (this.onSpeechResult) {
        this.onSpeechResult(result);
      }
    }
  }

  private handleSpeechPartialResults(event: SpeechResultsEvent) {
    if (event.value && event.value.length > 0) {
      const result: VoiceRecognitionResult = {
        transcript: event.value[0],
        confidence: 0.5, // Lower confidence for partial results
        isFinal: false,
      };

      console.log('Partial speech result:', result.transcript);
      
      if (this.onSpeechResult) {
        this.onSpeechResult(result);
      }
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onSpeechStart?: () => void;
    onSpeechResult?: (result: VoiceRecognitionResult) => void;
    onSpeechEnd?: () => void;
    onSpeechError?: (error: string) => void;
  }) {
    this.onSpeechStart = callbacks.onSpeechStart;
    this.onSpeechResult = callbacks.onSpeechResult;
    this.onSpeechEnd = callbacks.onSpeechEnd;
    this.onSpeechError = callbacks.onSpeechError;
  }

  /**
   * Utility methods
   */
  isRecognitionAvailable(): Promise<boolean> {
    return Voice.isAvailable();
  }

  getSupportedLanguages(): Promise<string[]> {
    return Voice.getSpeechRecognitionServices();
  }

  getCurrentListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Pronunciation practice helper
   */
  async practicePronunciation(
    targetWord: string,
    onResult: (accuracy: number, transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      // First, speak the word
      await this.speak(targetWord, { rate: 0.8 });

      // Wait a moment, then start listening
      setTimeout(async () => {
        this.setCallbacks({
          onSpeechResult: (result) => {
            if (result.isFinal) {
              const accuracy = this.calculatePronunciationAccuracy(targetWord, result.transcript);
              onResult(accuracy, result.transcript);
            }
          },
          onSpeechError: onError,
        });

        await this.startListening({
          language: 'en-US',
          continuous: false,
          partialResults: false,
          timeout: 5000,
        });
      }, 1500);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Pronunciation practice failed');
      }
    }
  }

  private calculatePronunciationAccuracy(target: string, spoken: string): number {
    const targetLower = target.toLowerCase().trim();
    const spokenLower = spoken.toLowerCase().trim();

    if (targetLower === spokenLower) {
      return 1.0; // Perfect match
    }

    // Simple Levenshtein distance-based accuracy
    const distance = this.levenshteinDistance(targetLower, spokenLower);
    const maxLength = Math.max(targetLower.length, spokenLower.length);
    const similarity = 1 - (distance / maxLength);

    return Math.max(0, similarity);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    try {
      this.stopSpeaking();
      await this.stopListening();
      await Voice.destroy();
      console.log('MobileVoiceService destroyed');
    } catch (error) {
      console.error('Error destroying MobileVoiceService:', error);
    }
  }
}

// Export singleton instance
export const mobileVoiceService = new MobileVoiceService();
export default mobileVoiceService;