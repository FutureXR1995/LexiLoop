/**
 * Voice Button Component
 * Provides TTS functionality for vocabulary words
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { voiceService, TTSOptions } from '@/services/voiceService';

interface VoiceButtonProps {
  text: string;
  options?: TTSOptions;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: string) => void;
}

export function VoiceButton({
  text,
  options = {},
  size = 'md',
  variant = 'ghost',
  className = '',
  disabled = false,
  onSpeakStart,
  onSpeakEnd,
  onError
}: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(voiceService.isTTSSupported());

  const handleClick = async () => {
    if (!isSupported) {
      if (onError) onError('Text-to-speech is not supported in this browser');
      return;
    }

    if (isPlaying) {
      // Stop current speech
      voiceService.stopSpeaking();
      setIsPlaying(false);
      if (onSpeakEnd) onSpeakEnd();
      return;
    }

    try {
      setIsPlaying(true);
      if (onSpeakStart) onSpeakStart();

      await voiceService.speak(text, {
        rate: 0.9,
        ...options
      });

      setIsPlaying(false);
      if (onSpeakEnd) onSpeakEnd();
    } catch (error) {
      setIsPlaying(false);
      const errorMessage = error instanceof Error ? error.message : 'Speech failed';
      if (onError) onError(errorMessage);
      console.error('Voice playback error:', error);
    }
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={`${getSizeClass()} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      title={isPlaying ? 'Stop pronunciation' : 'Play pronunciation'}
    >
      {isPlaying ? (
        <Loader2 size={getIconSize()} className="animate-spin" />
      ) : (
        <Volume2 size={getIconSize()} />
      )}
    </Button>
  );
}

/**
 * Voice Control Panel Component
 * Advanced controls for voice settings
 */
interface VoiceControlPanelProps {
  onVoiceChange?: (voice: string) => void;
  onRateChange?: (rate: number) => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

export function VoiceControlPanel({
  onVoiceChange,
  onRateChange,
  onVolumeChange,
  className = ''
}: VoiceControlPanelProps) {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(0.9);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState(voiceService.getVoices());

  React.useEffect(() => {
    // Update voices when they become available
    const updateVoices = () => {
      const availableVoices = voiceService.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        const preferred = voiceService.getPreferredVoice();
        if (preferred) {
          setSelectedVoice(preferred.name);
          if (onVoiceChange) onVoiceChange(preferred.name);
        }
      }
    };

    updateVoices();
    
    // Some browsers load voices asynchronously
    if (voices.length === 0) {
      setTimeout(updateVoices, 1000);
    }
  }, [selectedVoice, onVoiceChange, voices.length]);

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    if (onVoiceChange) onVoiceChange(voiceName);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (onRateChange) onRateChange(newRate);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (onVolumeChange) onVolumeChange(newVolume);
  };

  if (!voiceService.isTTSSupported()) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-700">
          Text-to-speech is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">Voice Settings</h3>
      
      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Voice</label>
        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a voice</option>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">
          Speed: {rate.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => handleRateChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}