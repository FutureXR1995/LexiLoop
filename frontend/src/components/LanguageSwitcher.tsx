/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { 
  locales, 
  localeNames, 
  localeFlags, 
  detectLocale, 
  saveLocalePreference,
  type Locale 
} from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'compact', 
  className = '' 
}: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh-CN');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const detected = detectLocale();
    setCurrentLocale(detected);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    saveLocalePreference(locale);
    setIsOpen(false);
    
    // Reload page with new locale
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.location.href = url.toString();
  };

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-optimized"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
          <span className="hidden md:inline">{localeNames[currentLocale]}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      currentLocale === locale ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{localeFlags[locale]}</span>
                    <span>{localeNames[locale]}</span>
                    {currentLocale === locale && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        选择语言 / Choose Language
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`p-3 border rounded-lg text-left transition-colors touch-optimized ${
              currentLocale === locale
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{localeFlags[locale]}</span>
              <div>
                <div className="font-medium">{localeNames[locale]}</div>
                <div className="text-xs text-gray-500">
                  {locale === 'zh-CN' && '中国大陆'}
                  {locale === 'zh-TW' && '台湾・香港'}
                  {locale === 'ja-JP' && '日本'}
                  {locale === 'en-US' && 'International'}
                  {locale === 'ko-KR' && '한국'}
                </div>
              </div>
              {currentLocale === locale && (
                <span className="ml-auto text-indigo-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Mobile Language Switcher
 * Optimized for mobile devices with bottom sheet
 */
export function MobileLanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh-CN');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const detected = detectLocale();
    setCurrentLocale(detected);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    saveLocalePreference(locale);
    setIsOpen(false);
    
    // Reload page with new locale
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.location.href = url.toString();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-optimized"
      >
        <Globe className="w-4 h-4" />
        <span>{localeFlags[currentLocale]} {localeNames[currentLocale]}</span>
      </button>

      {/* Mobile Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl safe-area-bottom">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-center mb-4">
                选择语言 / Choose Language
              </h3>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors touch-optimized ${
                      currentLocale === locale
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{localeFlags[locale]}</span>
                      <div className="flex-1">
                        <div className="font-medium text-base">{localeNames[locale]}</div>
                        <div className="text-sm text-gray-500">
                          {locale === 'zh-CN' && '中国大陆用户'}
                          {locale === 'zh-TW' && '台湾・香港用户'}
                          {locale === 'ja-JP' && '日本のユーザー'}
                          {locale === 'en-US' && 'International Users'}
                          {locale === 'ko-KR' && '한국 사용자'}
                        </div>
                      </div>
                      {currentLocale === locale && (
                        <span className="text-indigo-600 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-optimized"
              >
                取消 / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}