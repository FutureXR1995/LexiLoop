'use client';

import { useState } from 'react';
import PageLayout, { PageContainer } from '@/components/PageLayout';

export default function TestAuthPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setTestResult(`✅ Health API 工作正常: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Health API 错误: ${error}`);
    }
    setLoading(false);
  };

  const testRegisterAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123',
          name: 'Test User',
          username: 'testuser'
        })
      });
      
      const data = await response.json();
      setTestResult(`状态码: ${response.status}\n响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ 注册API错误: ${error}`);
    }
    setLoading(false);
  };

  const testLoginAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@lexiloop.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      setTestResult(`状态码: ${response.status}\n响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ 登录API错误: ${error}`);
    }
    setLoading(false);
  };

  return (
    <PageLayout>
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 API功能测试</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testHealthAPI}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试 Health API'}
            </button>
            
            <button
              onClick={testRegisterAPI}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试注册API'}
            </button>
            
            <button
              onClick={testLoginAPI}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试登录API'}
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">测试结果:</h3>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border overflow-auto">
                {testResult}
              </pre>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 测试说明</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• <strong>Health API</strong>: 测试基础API连接和数据库状态</li>
              <li>• <strong>注册API</strong>: 测试用户注册功能</li>
              <li>• <strong>登录API</strong>: 使用预设测试账户登录</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}