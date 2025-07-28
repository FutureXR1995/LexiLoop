/**
 * Responsive Header Component
 * Top navigation with language switcher and hamburger menu for mobile
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
  className?: string;
}

const navItems = [
  { href: '/learn', label: 'Learn', showMobile: true },
  { href: '/library', label: 'Library', showMobile: true },
  { href: '/progress', label: 'Progress', showMobile: true },
  { href: '/advanced-test', label: 'Advanced Tests', showMobile: false },
  { href: '/social', label: 'Social', showMobile: false },
];

export default function Header({ className = '' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`bg-white shadow-sm safe-area-top ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">LexiLoop</h1>
              <span className="ml-2 text-xs sm:text-sm text-gray-500">v0.1.0</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-600 hover:text-indigo-600 text-sm lg:text-base touch-optimized transition-colors"
              >
                {label}
              </Link>
            ))}
            
            {/* Language Switcher - Desktop */}
            <div className="ml-4">
              <LanguageSwitcher variant="compact" />
            </div>
            
            {/* Login Button */}
            <Link
              href="/auth/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm lg:text-base touch-optimized transition-colors ml-2"
            >
              Login
            </Link>
          </nav>
          
          {/* Mobile Menu Button & Language Switcher */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Switcher - Mobile */}
            <LanguageSwitcher variant="compact" className="mr-1" />
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors touch-optimized"
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
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
              onClick={closeMobileMenu}
            />
            
            {/* Mobile Menu */}
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
              <nav className="px-4 py-2 space-y-1">
                {navItems
                  .filter(item => item.showMobile)
                  .map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-3 py-3 text-base text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors touch-optimized"
                      onClick={closeMobileMenu}
                    >
                      {label}
                    </Link>
                  ))}
                
                {/* Mobile-only navigation items */}
                <Link
                  href="/advanced-test"
                  className="block px-3 py-3 text-base text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors touch-optimized"
                  onClick={closeMobileMenu}
                >
                  Advanced Tests
                </Link>
                
                <Link
                  href="/social"
                  className="block px-3 py-3 text-base text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors touch-optimized"
                  onClick={closeMobileMenu}
                >
                  Social
                </Link>
                
                {/* Login Button - Mobile */}
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors touch-optimized"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
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