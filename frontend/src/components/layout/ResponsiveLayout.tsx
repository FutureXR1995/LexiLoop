/**
 * Responsive Layout Component
 * Provides mobile-first responsive design utilities
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: (show: boolean) => void;
  className?: string;
}

interface BreakpointHook {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

// Custom hook for responsive breakpoints
export function useResponsiveBreakpoints(): BreakpointHook {
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    screenWidth
  };
}

// Responsive Container Component
export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl' 
}: { 
  children: React.ReactNode; 
  className?: string; 
  maxWidth?: string;
}) {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// Responsive Grid Component
export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { base: 1, sm: 2, lg: 3 }
}: { 
  children: React.ReactNode; 
  className?: string;
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
}) {
  const gridClasses = [
    `grid`,
    `grid-cols-${cols.base || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`, 
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    'gap-4 sm:gap-6',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Mobile-First Card Component
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'p-4 sm:p-6' 
}: { 
  children: React.ReactNode; 
  className?: string;
  padding?: string;
}) {
  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Collapsible Mobile Section
export function MobileCollapsible({
  title,
  children,
  defaultOpen = false,
  className = ''
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isMobile } = useResponsiveBreakpoints();

  // Always show on desktop
  if (!isMobile) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 text-left font-medium text-gray-900 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// Mobile Navigation Drawer
export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title = 'Menu'
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Responsive Button Component
export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base sm:px-6 sm:py-3',
    lg: 'px-6 py-3 text-lg sm:px-8 sm:py-4'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Main Responsive Layout
export function ResponsiveLayout({ 
  children, 
  showMobileMenu = false, 
  onMobileMenuToggle,
  className = '' 
}: ResponsiveLayoutProps) {
  const { isMobile } = useResponsiveBreakpoints();
  
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Menu Button */}
      {isMobile && onMobileMenuToggle && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => onMobileMenuToggle(!showMobileMenu)}
            className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}

// Typography Components with Responsive Sizing
export function ResponsiveHeading({ 
  level = 1, 
  children, 
  className = '' 
}: { 
  level?: 1 | 2 | 3 | 4 | 5 | 6; 
  children: React.ReactNode; 
  className?: string; 
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    4: 'text-base sm:text-lg lg:text-xl font-semibold',
    5: 'text-sm sm:text-base lg:text-lg font-medium',
    6: 'text-xs sm:text-sm lg:text-base font-medium'
  };

  return (
    <Tag className={`text-gray-900 ${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
}

export default ResponsiveLayout;