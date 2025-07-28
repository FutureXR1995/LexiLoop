'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

export default function TestSpeechPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectedText, setSelectedText] = useState('Hello, welcome to LexiLoop! This is a test of Azure Speech Services.');
  const [selectedVoice, setSelectedVoice] = useState('zh-CN-XiaoxiaoNeural');
  const [selectedSpeed, setSelectedSpeed] = useState('1.0');
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices = [
    { id: 'zh-CN-XiaoxiaoNeural', name: '中文女声 (晓晓)', lang: 'zh-CN' },
    { id: 'zh-CN-YunfengNeural', name: '中文男声 (云峰)', lang: 'zh-CN' },
    { id: 'en-US-AriaNeural', name: 'English Female (Aria)', lang: 'en-US' },
    { id: 'en-US-GuyNeural', name: 'English Male (Guy)', lang: 'en-US' },
    { id: 'ja-JP-NanamiNeural', name: '日语女声 (七海)', lang: 'ja-JP' },
    { id: 'ja-JP-KeitaNeural', name: '日语男声 (圭太)', lang: 'ja-JP' },
    { id: 'ko-KR-SunHiNeural', name: '韩语女声', lang: 'ko-KR' },
    { id: 'ko-KR-InJoonNeural', name: '韩语男声', lang: 'ko-KR' },
  ];

  const testTexts = [
    'Hello, welcome to LexiLoop! This is a test of Azure Speech Services.',
    '你好，欢迎使用LexiLoop！这是Azure语音服务的测试。',
    'こんにちは、LexiLoopへようこそ！これはAzure音声サービスのテストです。',
    '안녕하세요, LexiLoop에 오신 것을 환영합니다! 이것은 Azure 음성 서비스 테스트입니다.',
    'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
    '学而时习之，不亦说乎？有朋自远方来，不亦乐乎？',
  ];

  const generateSpeech = async () => {
    if (!selectedText.trim()) {
      alert('请输入要转换的文本');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/speech-synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          voice: selectedVoice,
          speed: selectedSpeed
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 获取音频文件的blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // 自动播放
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      alert(`语音生成失败: ${error}`);
    }
    setLoading(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `speech-${selectedVoice}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <PageLayout>
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🎙️ Azure语音服务测试</h1>
          
          {/* 文本输入区域 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">📝 输入要转换的文本</h3>
            <textarea
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入要转换为语音的文本..."
            />
            
            {/* 预设文本 */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">📋 预设测试文本:</h4>
              <div className="grid grid-cols-1 gap-2">
                {testTexts.map((text, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedText(text)}
                    className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-gray-700"
                  >
                    {text.length > 80 ? text.substring(0, 80) + '...' : text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 语音设置 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">⚙️ 语音设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择语音:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">语速:</label>
                <select
                  value={selectedSpeed}
                  onChange={(e) => setSelectedSpeed(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0.5">0.5x (很慢)</option>
                  <option value="0.75">0.75x (慢)</option>
                  <option value="1.0">1.0x (正常)</option>
                  <option value="1.25">1.25x (快)</option>
                  <option value="1.5">1.5x (很快)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 生成和播放控制 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateSpeech}
                disabled={loading || !selectedText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    正在生成语音...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    生成语音
                  </>
                )}
              </button>
              
              {audioUrl && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? '暂停' : '播放'}
                  </button>
                  
                  <button
                    onClick={downloadAudio}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    下载
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 音频播放器 */}
          {audioUrl && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold mb-4">🎵 音频播放器</h3>
              <audio
                ref={audioRef}
                controls
                onEnded={handleAudioEnd}
                className="w-full"
              >
                您的浏览器不支持音频播放。
              </audio>
            </div>
          )}

          {/* 说明信息 */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🔊 Azure语音服务功能</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• <strong>多语言支持</strong>: 中文、英语、日语、韩语等多种语言</li>
              <li>• <strong>神经语音</strong>: 使用最新的神经网络技术，声音更自然</li>
              <li>• <strong>可调语速</strong>: 支持0.5x到1.5x的语速调节</li>
              <li>• <strong>即时生成</strong>: 实时文本转语音，无需等待</li>
              <li>• <strong>高质量音频</strong>: 生成高品质的WAV格式音频文件</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}