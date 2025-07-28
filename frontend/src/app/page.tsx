/**
 * LexiLoop Homepage
 * Main landing page for the vocabulary learning platform
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { detectLocale, type Locale } from '@/lib/i18n';
import { useTranslations } from '@/lib/translations';

export default function Home() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh-CN');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const detected = detectLocale();
    setCurrentLocale(detected);
    setMounted(true);
    
    // Listen for locale changes
    const handleLocaleChange = (event: CustomEvent) => {
      setCurrentLocale(event.detail);
    };
    
    window.addEventListener('localeChange', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange as EventListener);
    };
  }, []);
  
  const t = useTranslations(currentLocale);
  
  if (!mounted) {
    return null; // Prevent hydration mismatch
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 md:pb-0">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 safe-area-left safe-area-right">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl heading-responsive">
            {t.home.title}
          </h2>
          <p className="mt-4 max-w-sm mx-auto text-base text-gray-500 sm:text-lg sm:max-w-md md:mt-5 md:text-xl md:max-w-3xl text-responsive">
            {t.home.subtitle}
          </p>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-400 sm:text-base">
            {t.home.heroDescription}
          </p>
          
          <div className="mt-6 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="rounded-md shadow">
              <Link
                href="/learn"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 touch-optimized btn-mobile"
              >
                {t.home.getStarted}
              </Link>
            </div>
            <div>
              <Link
                href="/demo"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 touch-optimized btn-mobile"
              >
                查看演示
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t.home.features.title}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 card-mobile card-hover touch-optimized">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📖</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {t.home.features.immersiveReading}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 text-responsive">
                  {t.home.features.immersiveReadingDesc}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 card-mobile card-hover touch-optimized">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🤖</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {t.home.features.aiGenerated}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 text-responsive">
                  {t.home.features.aiGeneratedDesc}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 card-mobile card-hover touch-optimized">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {t.home.features.vocabularyTracking}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 text-responsive">
                  {t.home.features.vocabularyTrackingDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-12 sm:mt-16 bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 card-mobile">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center touch-optimized">
              <div className="bg-indigo-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-indigo-600 font-bold text-sm sm:text-base">1</span>
              </div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Choose Words</h4>
              <p className="text-gray-600 text-xs sm:text-sm text-responsive">
                Select vocabulary words from our curated word books or create your own
              </p>
            </div>
            
            <div className="text-center touch-optimized">
              <div className="bg-indigo-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-indigo-600 font-bold text-sm sm:text-base">2</span>
              </div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Read Stories</h4>
              <p className="text-gray-600 text-xs sm:text-sm text-responsive">
                AI generates engaging stories that naturally incorporate your chosen words
              </p>
            </div>
            
            <div className="text-center touch-optimized">
              <div className="bg-indigo-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-indigo-600 font-bold text-sm sm:text-base">3</span>
              </div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Test & Learn</h4>
              <p className="text-gray-600 text-xs sm:text-sm text-responsive">
                Complete interactive tests to reinforce your learning and track progress
              </p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-12 sm:mt-16 bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 card-mobile">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
              🎉 Phase 1 Complete - Production Ready
            </h3>
            <p className="text-sm sm:text-base text-green-700 text-responsive">
              All core features implemented and ready for production deployment!
              Phase 2 development starting soon.
            </p>
            <div className="mt-4 text-xs sm:text-sm text-green-600 space-y-1 sm:space-y-0">
              <p className="block sm:inline">✅ Complete Frontend UI • ✅ User Authentication • ✅ Database Integration</p>
              <p className="block sm:inline">✅ Responsive Design • ✅ API Framework • ✅ Error Review System</p>
              <p className="block sm:inline">✅ Learning Plan Settings • ✅ Profile Management • ✅ Vocabulary Collections</p>
            </div>
            <div className="mt-4 text-xs text-green-500 space-y-1">
              <p>🚀 Ready for production deployment with Docker & Nginx</p>
              <p>🔒 Security headers and optimizations configured</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-12 sm:mt-16 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center safe-area-left safe-area-right">
          <p className="text-sm sm:text-base">&copy; 2024 LexiLoop. Made with ❤️ for language learners.</p>
          <p className="mt-2 text-gray-400 text-xs sm:text-sm text-responsive">
            Powered by OpenAI GPT-4o • Azure Speech Services • Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}