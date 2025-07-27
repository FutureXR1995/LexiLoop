/**
 * Azure Speech Services Integration
 * Real TTS and Speech Recognition using Azure Cognitive Services
 */

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

interface SpeechConfig {
  subscriptionKey: string;
  serviceRegion: string;
}

interface TTSOptions {
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  language?: string;
}

interface SpeechResult {
  audioData: ArrayBuffer;
  duration: number;
  success: boolean;
  error?: string;
}

export class AzureSpeechService {
  private speechConfig: SpeechSDK.SpeechConfig;
  private synthesizer: SpeechSDK.SpeechSynthesizer | null = null;
  private recognizer: SpeechSDK.SpeechRecognizer | null = null;

  constructor() {
    const subscriptionKey = process.env.NEXT_PUBLIC_SPEECH_API_KEY;
    const serviceRegion = process.env.NEXT_PUBLIC_SPEECH_REGION;

    if (!subscriptionKey || !serviceRegion) {
      throw new Error('Azure Speech Service credentials not configured');
    }

    this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );

    // Default voice settings
    this.speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';
    this.speechConfig.speechSynthesisOutputFormat = 
      SpeechSDK.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
  }

  /**
   * Convert text to speech using Azure Neural Voices
   */
  async synthesizeText(
    text: string, 
    options: TTSOptions = {}
  ): Promise<SpeechResult> {
    return new Promise((resolve) => {
      try {
        // Create audio config for in-memory output
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
        
        // Create synthesizer
        this.synthesizer = new SpeechSDK.SpeechSynthesizer(
          this.speechConfig, 
          audioConfig
        );

        // Build SSML for advanced voice control
        const ssml = this.buildSSML(text, options);

        // Synthesize speech
        this.synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              resolve({
                audioData: result.audioData,
                duration: this.calculateDuration(result.audioData),
                success: true
              });
            } else {
              resolve({
                audioData: new ArrayBuffer(0),
                duration: 0,
                success: false,
                error: `Speech synthesis failed: ${result.errorDetails}`
              });
            }
            
            // Clean up
            this.synthesizer?.close();
            this.synthesizer = null;
          },
          (error) => {
            resolve({
              audioData: new ArrayBuffer(0),
              duration: 0,
              success: false,
              error: `Speech synthesis error: ${error}`
            });
            
            // Clean up
            this.synthesizer?.close();
            this.synthesizer = null;
          }
        );
      } catch (error) {
        resolve({
          audioData: new ArrayBuffer(0),
          duration: 0,
          success: false,
          error: `Exception: ${error}`
        });
      }
    });
  }

  /**
   * Get audio URL for playing in browser
   */
  async getAudioURL(text: string, options: TTSOptions = {}): Promise<string | null> {
    try {
      const result = await this.synthesizeText(text, options);
      
      if (result.success && result.audioData.byteLength > 0) {
        const blob = new Blob([result.audioData], { type: 'audio/mp3' });
        return URL.createObjectURL(blob);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating audio URL:', error);
      return null;
    }
  }

  /**
   * Speak text directly (for immediate playback)
   */
  async speakText(text: string, options: TTSOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Create audio config for speaker output
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
        
        // Create synthesizer
        this.synthesizer = new SpeechSDK.SpeechSynthesizer(
          this.speechConfig, 
          audioConfig
        );

        // Build SSML
        const ssml = this.buildSSML(text, options);

        // Speak
        this.synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            resolve(result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted);
            this.synthesizer?.close();
            this.synthesizer = null;
          },
          (error) => {
            console.error('Speech error:', error);
            resolve(false);
            this.synthesizer?.close();
            this.synthesizer = null;
          }
        );
      } catch (error) {
        console.error('Exception in speakText:', error);
        resolve(false);
      }
    });
  }

  /**
   * Start speech recognition (for future pronunciation practice)
   */
  async startRecognition(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.SpeechRecognizer(
          this.speechConfig,
          audioConfig
        );

        this.recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              resolve(result.text);
            } else {
              reject(new Error(`Recognition failed: ${result.errorDetails}`));
            }
            
            this.recognizer?.close();
            this.recognizer = null;
          },
          (error) => {
            reject(new Error(`Recognition error: ${error}`));
            this.recognizer?.close();
            this.recognizer = null;
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get available voices (simplified for now)
   */
  async getAvailableVoices(): Promise<string[]> {
    // For now, return default voices. Voice list would require additional API calls
    return this.getDefaultVoices();
  }

  /**
   * Stop current speech synthesis
   */
  stopSpeaking(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }

  /**
   * Stop current speech recognition
   */
  stopRecognition(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopSpeaking();
    this.stopRecognition();
  }

  /**
   * Build SSML for advanced voice control
   */
  private buildSSML(text: string, options: TTSOptions): string {
    const voice = options.voice || 'en-US-AriaNeural';
    const rate = options.rate || '1.0';
    const pitch = options.pitch || '0%';
    const volume = options.volume || '100';
    const language = options.language || 'en-US';

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
            ${this.escapeXML(text)}
          </prosody>
        </voice>
      </speak>
    `;
  }

  /**
   * Escape XML characters in text
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Calculate audio duration (approximate)
   */
  private calculateDuration(audioData: ArrayBuffer): number {
    // Rough estimate: 48kHz, 192kbps MP3
    const bytesPerSecond = 24000; // 192kbps / 8
    return audioData.byteLength / bytesPerSecond;
  }

  /**
   * Get default voice options
   */
  private getDefaultVoices(): string[] {
    return [
      'en-US-AriaNeural',      // Female, warm
      'en-US-JennyNeural',     // Female, cheerful
      'en-US-GuyNeural',       // Male, steady
      'en-US-DavisNeural',     // Male, energetic
      'en-GB-LibbyNeural',     // British Female
      'en-GB-MaisieNeural',    // British Female, young
      'en-AU-NatashaNeural',   // Australian Female
      'en-CA-ClaraNeural',     // Canadian Female
    ];
  }
}

// Export singleton instance
export const azureSpeechService = new AzureSpeechService();

// Export for use in components
export default azureSpeechService;