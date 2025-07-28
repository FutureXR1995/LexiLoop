/**
 * Page Layout Component
 * Common layout with header for all application pages
 */

import { ReactNode } from 'react';
import Header from '@/components/Header';
import { MobileTabBarSpacer } from '@/components/MobileNavigation';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showMobileNav?: boolean;
}

export default function PageLayout({ 
  children, 
  className = '',
  showMobileNav = true 
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Header />
      
      <main className="pb-2">
        {children}
      </main>
      
      {/* Add spacing for mobile navigation if enabled */}
      {showMobileNav && <MobileTabBarSpacer />}
    </div>
  );
}

/**
 * Page Container
 * Standard container with responsive padding
 */
export function PageContainer({ 
  children, 
  className = '' 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 safe-area-left safe-area-right ${className}`}>
      {children}
    </div>
  );
}