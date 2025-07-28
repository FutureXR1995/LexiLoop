/**
 * Responsive Header Component
 * Top navigation with language switcher and hamburger menu for mobile
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, TrendingUp, Users, TestTube, MessageCircle, User } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { detectLocale, type Locale } from '@/lib/i18n';
import { useTranslations } from '@/lib/translations';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh-CN');
  
  useEffect(() => {
    const detected = detectLocale();
    setCurrentLocale(detected);
    
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
  
  const navItems = [
    { href: '/learn', label: t.nav.learn, icon: BookOpen, showMobile: true },
    { href: '/library', label: t.nav.library, icon: Users, showMobile: true },
    { href: '/progress', label: t.nav.progress, icon: TrendingUp, showMobile: true },
    { href: '/advanced-test', label: t.nav.advancedTests, icon: TestTube, showMobile: false },
    { href: '/social', label: t.nav.social, icon: MessageCircle, showMobile: false },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`bg-white shadow-lg border-b border-gray-100 safe-area-top ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group" onClick={closeMobileMenu}>
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  LexiLoop
                </h1>
                <span className="text-xs text-gray-400 leading-none">Smart Learning</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm lg:text-base font-medium touch-optimized transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            
            {/* Language Switcher - Desktop */}
            <div className="ml-2">
              <LanguageSwitcher variant="compact" />
            </div>
            
            {/* Login Button */}
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm lg:text-base font-medium touch-optimized transition-all duration-200 ml-2 shadow-md hover:shadow-lg"
            >
              <User className="w-4 h-4" />
              {t.nav.login}
            </Link>
          </nav>
          
          {/* Mobile Menu Button & Language Switcher */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Switcher - Mobile */}
            <LanguageSwitcher variant="compact" />
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 touch-optimized"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu - Positioned as dropdown from header */}
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="px-4 py-4 space-y-1 max-h-96 overflow-y-auto">
              {navItems
                .filter(item => item.showMobile)
                .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 touch-optimized"
                    onClick={closeMobileMenu}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              
              {/* Mobile-only navigation items */}
              <Link
                href="/advanced-test"
                className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 touch-optimized"
                onClick={closeMobileMenu}
              >
                <TestTube className="w-5 h-5" />
                {t.nav.advancedTests}
              </Link>
              
              <Link
                href="/social"
                className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 touch-optimized"
                onClick={closeMobileMenu}
              >
                <MessageCircle className="w-5 h-5" />
                {t.nav.social}
              </Link>
              
              {/* Login Button - Mobile */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 touch-optimized font-medium shadow-md"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5" />
                  {t.nav.login}
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

/**
 * Header Spacer Component
 * Adds top padding to prevent content from being hidden behind fixed header
 */
export function HeaderSpacer() {
  return <div className="h-16 sm:h-20" />;
}