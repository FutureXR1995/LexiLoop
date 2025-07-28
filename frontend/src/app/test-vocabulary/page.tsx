'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Plus, Star, Download, Globe } from 'lucide-react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

export default function TestVocabularyPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [testResults, setTestResults] = useState<string>('');

  // 免费词汇数据源
  const vocabularySources = [
    {
      name: 'Oxford 3000 Words',
      description: '牛津大学选定的3000个最重要英语单词',
      url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
      type: 'English Core',
      free: true
    },
    {
      name: 'Google 10000 English',
      description: 'Google频率统计的10000个常用英语单词',
      url: 'https://github.com/first20hours/google-10000-english',
      type: 'Frequency',
      free: true
    },
    {
      name: 'COCA Word List',
      description: '美国当代英语语料库词汇表',
      url: 'https://www.wordfrequency.info/samples.asp',
      type: 'Academic',
      free: true
    },
    {
      name: 'HSK Chinese Words',
      description: '汉语水平考试(HSK)词汇表',
      url: 'https://github.com/gigacool/hsk-words',
      type: 'Chinese',
      free: true
    },
    {
      name: 'JLPT Vocabulary',
      description: '日本语能力测试(JLPT)词汇',
      url: 'https://github.com/scriptin/jlpt-vocab',
      type: 'Japanese',
      free: true
    },
    {
      name: 'Wiktionary',
      description: '维基词典开源词汇数据',
      url: 'https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists',
      type: 'Multi-language',
      free: true
    }
  ];

  const sampleVocabulary = [
    {
      word: 'apple',
      definition: 'a round fruit with red, green, or yellow skin',
      pronunciation: '/ˈæpəl/',
      partOfSpeech: 'noun',
      difficulty: 'beginner',
      examples: ['I eat an apple every day.', 'Apple pie is delicious.'],
      tags: ['food', 'fruit', 'health']
    },
    {
      word: 'friendship',
      definition: 'the relationship between friends',
      pronunciation: '/ˈfrɛndʃɪp/',
      partOfSpeech: 'noun',
      difficulty: 'intermediate',
      examples: ['Their friendship lasted for decades.', 'Friendship is very important.'],
      tags: ['relationship', 'emotion', 'social']
    },
    {
      word: 'perseverance',
      definition: 'persistence in doing something despite difficulty',
      pronunciation: '/ˌpɜrsəˈvɪrəns/',
      partOfSpeech: 'noun',
      difficulty: 'advanced',
      examples: ['Success requires perseverance.', 'Her perseverance paid off.'],
      tags: ['character', 'determination', 'success']
    }
  ];

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vocabulary-collections');
      const data = await response.json();
      setTestResults(`数据库连接状态: ${response.ok ? '✅ 成功' : '❌ 失败'}\n响应: ${JSON.stringify(data, null, 2)}`);
      if (response.ok && data.collections) {
        setCollections(data.collections);
      }
    } catch (error) {
      setTestResults(`❌ 数据库连接错误: ${error}`);
    }
    setLoading(false);
  };

  const testCreateCollection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vocabulary-collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '测试词汇集合',
          description: '这是一个测试用的词汇集合',
          category: 'test',
          level: 'BEGINNER',
          isPublic: true
        })
      });
      
      const data = await response.json();
      setTestResults(`创建集合状态: ${response.ok ? '✅ 成功' : '❌ 失败'}\n响应: ${JSON.stringify(data, null, 2)}`);
      
      if (response.ok) {
        // 刷新集合列表
        testDatabaseConnection();
      }
    } catch (error) {
      setTestResults(`❌ 创建集合错误: ${error}`);
    }
    setLoading(false);
  };

  const importSampleWords = async () => {
    setLoading(true);
    try {
      // 首先创建一个示例集合
      const collectionResponse = await fetch('/api/vocabulary-collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '示例词汇集合',
          description: '包含不同难度词汇的示例集合',
          category: 'sample',
          level: 'INTERMEDIATE',
          isPublic: true
        })
      });
      
      if (!collectionResponse.ok) {
        throw new Error('创建集合失败');
      }
      
      const collection = await collectionResponse.json();
      
      // 然后添加示例词汇
      const wordsResponse = await fetch('/api/vocabulary-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: collection.collection.id,
          words: sampleVocabulary
        })
      });
      
      const wordsData = await wordsResponse.json();
      setTestResults(`导入示例词汇状态: ${wordsResponse.ok ? '✅ 成功' : '❌ 失败'}\n响应: ${JSON.stringify(wordsData, null, 2)}`);
      
      if (wordsResponse.ok) {
        testDatabaseConnection();
      }
    } catch (error) {
      setTestResults(`❌ 导入词汇错误: ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  return (
    <PageLayout>
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">📚 词汇数据库测试</h1>
          
          {/* 测试按钮区域 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? '测试中...' : '🔍 测试数据库连接'}
            </button>
            
            <button
              onClick={testCreateCollection}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? '创建中...' : '➕ 创建测试集合'}
            </button>
            
            <button
              onClick={importSampleWords}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? '导入中...' : '📥 导入示例词汇'}
            </button>
          </div>

          {/* 测试结果 */}
          {testResults && (
            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">测试结果:</h3>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border overflow-auto max-h-64">
                {testResults}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 当前词汇集合 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">📖 当前词汇集合</h3>
              {collections.length > 0 ? (
                <div className="space-y-4">
                  {collections.map((collection, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-lg">{collection.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{collection.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {collection.category}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {collection.level}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {collection.wordCount || 0} 词汇
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">暂无词汇集合，点击上面的按钮创建测试数据</p>
              )}
            </div>

            {/* 免费词汇资源 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">🌐 免费词汇数据源</h3>
              <div className="space-y-4">
                {vocabularySources.map((source, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{source.name}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        免费
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{source.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {source.type}
                      </span>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        查看资源 →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 示例词汇预览 */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">📝 示例词汇结构</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleVocabulary.map((word, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-blue-900">{word.word}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      word.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      word.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {word.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{word.pronunciation}</p>
                  <p className="text-sm text-gray-800 mb-2">{word.definition}</p>
                  <div className="text-xs text-gray-500">
                    <p><strong>例句:</strong> {word.examples[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 说明信息 */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💡 词汇数据库功能说明</h3>
            <ul className="space-y-2 text-green-800">
              <li>• <strong>多语言支持</strong>: 英语、中文、日语、韩语等多种语言词汇</li>
              <li>• <strong>分级管理</strong>: 按难度级别 (初级/中级/高级) 组织词汇</li>
              <li>• <strong>丰富信息</strong>: 包含发音、定义、例句、词性等完整信息</li>
              <li>• <strong>免费资源</strong>: 整合多个开源和免费的词汇数据库</li>
              <li>• <strong>智能标签</strong>: 按主题和用途对词汇进行分类</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}