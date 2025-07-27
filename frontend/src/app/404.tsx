/**
 * Custom 404 Error Page
 * Shown when a page is not found
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">页面未找到</h2>
          <p className="text-gray-600">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors touch-optimized"
          >
            返回首页
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/learn"
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-indigo-200 touch-optimized"
            >
              开始学习
            </Link>
            <Link
              href="/library"
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-indigo-200 touch-optimized"
            >
              词库
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>如果您认为这是一个错误，请联系我们的支持团队。</p>
        </div>
      </div>
    </div>
  );
}