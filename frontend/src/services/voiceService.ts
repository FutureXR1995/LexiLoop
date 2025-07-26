/**
 * Voice Service
 * Handles Text-to-Speech and Speech Recognition functionality
 */

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null; // SpeechRecognition
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      console.log('VoiceService: Initializing in browser environment');
      this.synth = window.speechSynthesis;
      this.initializeVoices();
      this.initializeSpeechRecognition();
      console.log('VoiceService: Initialization complete');
    } else {
      console.log('VoiceService: Server-side environment, skipping initialization');
    }
  }

  /**
   * Initialize available voices
   */
  private initializeVoices() {
    if (!this.synth) {
      console.log('VoiceService: No speechSynthesis available');
      return;
    }
    
    const loadVoices = () => {
      if (this.synth) {
        this.voices = this.synth.getVoices();
        console.log(`VoiceService: Loaded ${this.voices.length} voices`);
        
        if (this.voices.length > 0) {
          console.log('VoiceService: Available voices:', 
            this.voices.slice(0, 5).map(v => `${v.name} (${v.lang})`).join(', '),
            this.voices.length > 5 ? `... and ${this.voices.length - 5} more` : ''
          );
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Some browsers load voices asynchronously
    if (this.voices.length === 0 && this.synth) {
      console.log('VoiceService: Voices not loaded yet, waiting for onvoiceschanged event');
      this.synth.onvoiceschanged = () => {
        console.log('VoiceService: onvoiceschanged event fired');
        loadVoices();
      };
    }
  }

  /**
   * Initialize Speech Recognition API
   */
  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Convert text to speech
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('VoiceService.speak called:', { text, options });
      
      if (!this.synth) {
        const error = 'Speech synthesis not supported';
        console.error('VoiceService:', error);
        reject(new Error(error));
        return;
      }

      // Stop any ongoing speech
      console.log('VoiceService: Canceling any existing speech');
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
          console.log('VoiceService: Using voice:', voice.name);
        } else {
          console.log('VoiceService: Requested voice not found:', options.voice);
        }
      }
      
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? 'en-US';

      console.log('VoiceService: Speech settings:', {
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume,
        lang: utterance.lang,
        voice: utterance.voice?.name || 'default'
      });

      utterance.onstart = () => {
        console.log('VoiceService: Speech started');
      };

      utterance.onend = () => {
        console.log('VoiceService: Speech ended');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('VoiceService: Speech error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      console.log('VoiceService: Queueing speech');
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  /**
   * Get preferred voice for language learning
   */
  getPreferredVoice(lang: string = 'en'): SpeechSynthesisVoice | null {
    const preferredVoices = [
      'Microsoft Zira - English (United States)',
      'Google US English',
      'Alex',
      'Samantha'
    ];

    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.includes(voiceName) && v.lang.startsWith(lang)
      );
      if (voice) return voice;
    }

    // Fallback to first available voice for the language
    return this.voices.find(v => v.lang.startsWith(lang)) || null;
  }

  /**
   * Start speech recognition
   */
  async startListening(
    onResult: (result: SpeechResult) => void,
    onError?: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      // Apply options
      this.recognition.lang = options.lang ?? 'en-US';
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const results = event.results;
        for (let i = event.resultIndex; i < results.length; i++) {
          const result = results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          onResult({
            transcript,
            confidence,
            isFinal: result.isFinal
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = `Speech recognition error: ${event.error}`;
        if (onError) onError(errorMessage);
        else reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Stop speech recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  isListeningActive(): boolean {
    return this.isListening;
  }

  /**
   * Check if speech synthesis is supported
   */
  isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Check if speech recognition is supported
   */
  isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Get feature support status
   */
  getSupport() {
    return {
      textToSpeech: this.isTTSSupported(),
      speechRecognition: this.isSpeechRecognitionSupported(),
      voiceCount: this.voices.length
    };
  }

  /**
   * Pronunciation practice helper
   */
  async practicePronunciation(
    targetWord: string,
    onResult: (accuracy: number, transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // First, speak the word
    await this.speak(targetWord, { rate: 0.8 });

    // Wait a moment, then start listening
    setTimeout(() => {
      this.startListening(
        (result) => {
          if (result.isFinal) {
            const accuracy = this.calculatePronunciationAccuracy(targetWord, result.transcript);
            onResult(accuracy, result.transcript);
          }
        },
        onError,
        { continuous: false, interimResults: false }
      );
    }, 1000);
  }

  /**
   * Calculate pronunciation accuracy (simple implementation)
   */
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

  /**
   * Calculate Levenshtein distance between two strings
   */
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
}

// Create and export singleton instance
export const voiceService = new VoiceService();
export default voiceService;