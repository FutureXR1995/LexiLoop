/**
 * Voice Control Panel
 * Test panel for Azure Speech Services integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import azureSpeechService from '@/services/azureSpeechService';

interface VoiceControlPanelProps {
  isEnabled?: boolean;
  onTestResult?: (success: boolean, message: string) => void;
}

export function VoiceControlPanel({ isEnabled = true, onTestResult }: VoiceControlPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceReady, setIsServiceReady] = useState(false);
  const [testText, setTestText] = useState('Hello! This is a test of Azure Speech Services integration.');
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
  const [speechRate, setSpeechRate] = useState('1.0');
  const [lastTestResult, setLastTestResult] = useState<string>('');

  // Test if Azure Speech Service is properly configured
  useEffect(() => {
    const checkService = async () => {
      try {
        const voices = await azureSpeechService.getAvailableVoices();
        setIsServiceReady(voices.length > 0);
      } catch (error) {
        console.error('Azure Speech Service check failed:', error);
        setIsServiceReady(false);
      }
    };

    if (isEnabled) {
      checkService();
    }
  }, [isEnabled]);

  const handleTestTTS = async () => {
    if (!testText.trim()) return;

    setIsLoading(true);
    setLastTestResult('Testing...');

    try {
      const success = await azureSpeechService.speakText(testText, {
        voice: selectedVoice,
        rate: speechRate,
        volume: '100',
        pitch: '0%'
      });

      const result = success ? 'TTS test successful!' : 'TTS test failed';
      setLastTestResult(result);
      
      if (onTestResult) {
        onTestResult(success, result);
      }
    } catch (error) {
      const errorMsg = `TTS test error: ${error}`;
      setLastTestResult(errorMsg);
      
      if (onTestResult) {
        onTestResult(false, errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTTS = () => {
    azureSpeechService.stopSpeaking();
    setLastTestResult('TTS stopped');
  };

  const handleGetAudioURL = async () => {
    if (!testText.trim()) return;

    setIsLoading(true);
    setLastTestResult('Generating audio URL...');

    try {
      const audioURL = await azureSpeechService.getAudioURL(testText, {
        voice: selectedVoice,
        rate: speechRate
      });

      if (audioURL) {
        setLastTestResult(`Audio URL generated: ${audioURL.substring(0, 50)}...`);
        
        // Optionally play the audio
        const audio = new Audio(audioURL);
        audio.play();
      } else {
        setLastTestResult('Failed to generate audio URL');
      }
    } catch (error) {
      const errorMsg = `Audio URL generation error: ${error}`;
      setLastTestResult(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <p className="text-gray-600">Voice controls disabled</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Azure Speech Services Test Panel</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isServiceReady ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isServiceReady ? 'Service Ready' : 'Service Not Ready'}
          </span>
        </div>
      </div>

      {/* Test Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Text
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter text to test speech synthesis..."
        />
      </div>

      {/* Voice Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en-US-AriaNeural">Aria (US Female)</option>
            <option value="en-US-JennyNeural">Jenny (US Female)</option>
            <option value="en-US-GuyNeural">Guy (US Male)</option>
            <option value="en-US-DavisNeural">Davis (US Male)</option>
            <option value="en-GB-LibbyNeural">Libby (UK Female)</option>
            <option value="en-GB-MaisieNeural">Maisie (UK Female)</option>
            <option value="en-AU-NatashaNeural">Natasha (AU Female)</option>
            <option value="en-CA-ClaraNeural">Clara (CA Female)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speech Rate: {speechRate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTestTTS}
          disabled={isLoading || !isServiceReady || !testText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Testing...' : '🔊 Test Direct Speech'}
        </button>

        <button
          onClick={handleGetAudioURL}
          disabled={isLoading || !isServiceReady || !testText.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : '🎵 Generate Audio URL'}
        </button>

        <button
          onClick={handleStopTTS}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          ⏹️ Stop
        </button>
      </div>

      {/* Test Result */}
      {lastTestResult && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Result:</strong> {lastTestResult}
          </p>
        </div>
      )}

      {/* Environment Info */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Environment Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div>API Key: {process.env.NEXT_PUBLIC_SPEECH_API_KEY ? '✅ Configured' : '❌ Missing'}</div>
          <div>Region: {process.env.NEXT_PUBLIC_SPEECH_REGION || '❌ Not set'}</div>
          <div>TTS Enabled: {process.env.NEXT_PUBLIC_ENABLE_REAL_TTS || 'false'}</div>
          <div>Service Status: {isServiceReady ? '✅ Ready' : '❌ Not Ready'}</div>
        </div>
      </div>
    </div>
  );
}