/**
 * Custom 500 Error Page
 * Shown when a server error occurs
 */

import Link from 'next/link';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">服务器错误</h2>
          <p className="text-gray-600">
            抱歉，服务器遇到了一些问题。我们正在努力修复中。
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors touch-optimized"
          >
            重新加载页面
          </button>
          
          <Link
            href="/"
            className="block w-full bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-red-200 touch-optimized"
          >
            返回首页
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-red-100">
          <h3 className="font-semibold text-gray-900 mb-2">可能的解决方案：</h3>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• 检查您的网络连接</li>
            <li>• 稍后再试</li>
            <li>• 清除浏览器缓存</li>
            <li>• 如果问题持续，请联系支持团队</li>
          </ul>
        </div>
        
        <div className="mt-8 text-xs text-gray-500">
          <p>错误代码: 500 | 时间: {new Date().toLocaleString('zh-CN')}</p>
        </div>
      </div>
    </div>
  );
}