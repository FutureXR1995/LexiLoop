/**
 * Azure Speech Services Test Page
 * Dedicated page for testing Azure TTS integration
 */

'use client';

import React, { useState } from 'react';
import { VoiceControlPanel } from '@/components/features/reading/VoiceControlPanel';

export default function AzureSpeechTestPage() {
  const [testResults, setTestResults] = useState<Array<{ timestamp: Date; success: boolean; message: string }>>([]);

  const handleTestResult = (success: boolean, message: string) => {
    setTestResults(prev => [
      { timestamp: new Date(), success, message },
      ...prev.slice(0, 9) // Keep last 10 results
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Azure Speech Services Integration Test
          </h1>
          <p className="text-gray-600">
            Test the Azure Speech Services TTS functionality for LexiLoop reading interface
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Application
          </button>
        </div>

        {/* Voice Control Panel */}
        <div className="mb-8">
          <VoiceControlPanel 
            isEnabled={true} 
            onTestResult={handleTestResult}
          />
        </div>

        {/* Test Results History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Test Results History</h2>
            {testResults.length > 0 && (
              <button
                onClick={clearResults}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear History
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {testResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No test results yet. Run a test to see results here.
              </div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        result.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-900">{result.message}</p>
                        <p className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Azure Speech API Key</span>
                <span className={`text-sm ${
                  process.env.NEXT_PUBLIC_SPEECH_API_KEY ? 'text-green-600' : 'text-red-600'
                }`}>
                  {process.env.NEXT_PUBLIC_SPEECH_API_KEY ? '✅ Configured' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Azure Region</span>
                <span className={`text-sm ${
                  process.env.NEXT_PUBLIC_SPEECH_REGION ? 'text-green-600' : 'text-red-600'
                }`}>
                  {process.env.NEXT_PUBLIC_SPEECH_REGION ? 
                    `✅ ${process.env.NEXT_PUBLIC_SPEECH_REGION}` : '❌ Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Real TTS Enabled</span>
                <span className={`text-sm ${
                  process.env.NEXT_PUBLIC_ENABLE_REAL_TTS === 'true' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {process.env.NEXT_PUBLIC_ENABLE_REAL_TTS === 'true' ? '✅ Enabled' : '⚠️ Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Integration Features */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-gray-600">Text-to-Speech Synthesis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-gray-600">Multiple Neural Voices</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-gray-600">Audio URL Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-gray-600">Speech Rate Control</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">🚧</span>
                <span className="text-sm text-gray-600">Speech Recognition (Future)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Usage Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>1. Ensure Azure Speech Services API key and region are configured in environment variables</p>
            <p>2. Enter text in the test panel above and select a voice</p>
            <p>3. Click &quot;Test Direct Speech&quot; to speak immediately through speakers</p>
            <p>4. Click &quot;Generate Audio URL&quot; to create an audio file URL for playback</p>
            <p>5. Use the rate slider to adjust speech speed</p>
            <p>6. The integration is now ready for use in the reading interface</p>
          </div>
        </div>
      </div>
    </div>
  );
}