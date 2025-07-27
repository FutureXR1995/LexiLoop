/**
 * Voice Debug Page
 * Test voice functionality independently
 */

'use client';

import React, { useState, useEffect } from 'react';
import { VoiceButton } from '@/components/features/voice/VoiceButton';
import { voiceService } from '@/services/voiceService';

export default function VoiceDebugPage() {
  const [testText, setTestText] = useState('Hello world');
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Get support information
    const support = voiceService.getSupport();
    setSupportInfo(support);
    
    // Get available voices
    const availableVoices = voiceService.getVoices();
    setVoices(availableVoices);

    console.log('Voice Debug Info:', {
      support,
      voiceCount: availableVoices.length,
      voices: availableVoices.map(v => ({ name: v.name, lang: v.lang }))
    });
  }, []);

  const handleDirectSpeak = async () => {
    try {
      setError(null);
      setIsPlaying(true);
      console.log('Starting direct speech for:', testText);
      
      await voiceService.speak(testText, {
        rate: 0.9,
        pitch: 1,
        volume: 1
      });
      
      console.log('Speech completed successfully');
      setIsPlaying(false);
    } catch (err) {
      console.error('Speech error:', err);
      setError(err instanceof Error ? err.message : 'Speech failed');
      setIsPlaying(false);
    }
  };

  const handleBrowserAPITest = () => {
    try {
      if (!window.speechSynthesis) {
        setError('SpeechSynthesis not supported');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('Browser API: Speech started');
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        console.log('Browser API: Speech ended');
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Browser API: Speech error:', event);
        setError(`Browser API Error: ${event.error}`);
        setIsPlaying(false);
      };

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
      
      console.log('Browser API: Speech queued');
    } catch (err) {
      console.error('Browser API test failed:', err);
      setError(err instanceof Error ? err.message : 'Browser API test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">🔧 Voice Debug</h1>
        
        {/* Navigation Links */}
        <div className="text-center mb-8">
          <div className="inline-flex gap-3">
            <a
              href="/azure-speech-test"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🎤 Azure Speech
            </a>
            <a
              href="/claude-ai-test"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              🤖 Claude AI
            </a>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
        
        {/* Support Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Support</h2>
          {supportInfo && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Text-to-Speech:</span>
                <span className={supportInfo.textToSpeech ? 'text-green-600' : 'text-red-600'}>
                  {supportInfo.textToSpeech ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Speech Recognition:</span>
                <span className={supportInfo.speechRecognition ? 'text-green-600' : 'text-red-600'}>
                  {supportInfo.speechRecognition ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available Voices:</span>
                <span>{supportInfo.voiceCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Available Voices */}
        {voices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Voices</h2>
            <div className="max-h-40 overflow-y-auto">
              {voices.map((voice, index) => (
                <div key={index} className="text-sm py-1 border-b border-gray-100">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-gray-500 ml-2">({voice.lang})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Text:</label>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to speak"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDirectSpeak}
                disabled={isPlaying}
                className={`
                  px-4 py-2 rounded-md font-medium transition-colors
                  ${isPlaying 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isPlaying ? '🔊 Speaking...' : '🔊 Direct VoiceService'}
              </button>

              <button
                onClick={handleBrowserAPITest}
                disabled={isPlaying}
                className={`
                  px-4 py-2 rounded-md font-medium transition-colors
                  ${isPlaying 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
              >
                🌐 Browser API Test
              </button>

              <VoiceButton
                text={testText}
                size="md"
                variant="outline"
                onSpeakStart={() => console.log('VoiceButton: Speech started')}
                onSpeakEnd={() => console.log('VoiceButton: Speech ended')}
                onError={(error) => {
                  console.error('VoiceButton error:', error);
                  setError(`VoiceButton Error: ${error}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <ul className="space-y-1 text-gray-700">
            <li>• Open browser console for detailed logs</li>
            <li>• Make sure you&apos;re using HTTPS or localhost</li>
            <li>• Check browser compatibility (Chrome, Firefox, Safari)</li>
            <li>• Ensure system volume is turned up</li>
            <li>• Try different browsers if one doesn&apos;t work</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="text-center mt-6">
          <a
            href="/reading"
            className="text-blue-600 hover:underline"
          >
            ← Back to Reading
          </a>
        </div>
      </div>
    </div>
  );
}