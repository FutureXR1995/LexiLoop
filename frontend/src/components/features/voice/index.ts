/**
 * Voice Components Barrel Export
 * Centralized exports for all voice-related components
 */

export { VoiceButton, VoiceControlPanel } from './VoiceButton';
export { SpeechRecognition, SpeechRecognitionButton } from './SpeechRecognition';
export { 
  VoiceInteraction, 
  CompactVoiceInteraction, 
  VoiceQuiz 
} from './VoiceInteraction';

// Re-export voice service types for convenience
export type { TTSOptions, SpeechRecognitionOptions, SpeechResult } from '@/services/voiceService';