'use client';

import { useState } from 'react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

export default function TestAIPage() {
  const [story, setStory] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>(['apple', 'friendship', 'adventure']);

  const testStoryGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: selectedWords,
          level: 'intermediate',
          genre: 'adventure',
          length: 'short'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStory(data.story || JSON.stringify(data, null, 2));
    } catch (error) {
      setStory(`❌ AI故事生成错误: ${error}`);
    }
    setLoading(false);
  };

  const testVocabularyGeneration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'daily life',
          level: 'beginner',
          count: 10
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVocabulary(JSON.stringify(data, null, 2));
    } catch (error) {
      setVocabulary(`❌ 词汇生成错误: ${error}`);
    }
    setLoading(false);
  };

  const addWord = () => {
    const word = prompt('请输入一个单词:');
    if (word && !selectedWords.includes(word.toLowerCase())) {
      setSelectedWords([...selectedWords, word.toLowerCase()]);
    }
  };

  const removeWord = (word: string) => {
    setSelectedWords(selectedWords.filter(w => w !== word));
  };

  return (
    <PageLayout>
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🤖 Claude AI功能测试</h1>
          
          {/* 词汇选择区域 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">📝 选择词汇 (用于故事生成)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedWords.map((word) => (
                <span
                  key={word}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                  onClick={() => removeWord(word)}
                >
                  {word} ✕
                </span>
              ))}
            </div>
            <button
              onClick={addWord}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              + 添加词汇
            </button>
          </div>

          {/* 测试按钮 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testStoryGeneration}
              disabled={loading || selectedWords.length === 0}
              className="px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? '🤖 AI正在创作故事...' : '🗣️ 生成AI故事'}
            </button>
            
            <button
              onClick={testVocabularyGeneration}
              disabled={loading}
              className="px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? '🤖 AI正在生成词汇...' : '📚 生成词汇集'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 故事展示区域 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">📖 AI生成的故事</h3>
              {story ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-purple-900">
                      {story}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">点击上面的按钮生成AI故事...</p>
              )}
            </div>

            {/* 词汇展示区域 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-indigo-800 mb-4">📚 AI生成的词汇</h3>
              {vocabulary ? (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-indigo-900 overflow-auto max-h-96">
                    {vocabulary}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 italic">点击上面的按钮生成词汇集...</p>
              )}
            </div>
          </div>

          {/* 说明信息 */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚡ Claude AI集成说明</h3>
            <ul className="space-y-2 text-yellow-800">
              <li>• <strong>故事生成</strong>: 使用Claude API根据选定词汇创建个性化学习故事</li>
              <li>• <strong>词汇生成</strong>: 根据主题和难度级别生成相关词汇集合</li>
              <li>• <strong>智能适配</strong>: AI会根据学习水平调整内容难度和长度</li>
              <li>• <strong>教育优化</strong>: 所有内容都经过教育价值优化，适合语言学习</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}