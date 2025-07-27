/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, BarChart3, User, BookOpen } from 'lucide-react';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: BookOpen,
  },
  {
    href: '/library',
    label: 'Library',
    icon: Book,
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: BarChart3,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center space-y-1 touch-optimized transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Mobile Tab Bar Spacer
 * Adds bottom padding to prevent content from being hidden behind mobile nav
 */
export function MobileTabBarSpacer() {
  return <div className="h-16 md:hidden" />;
}