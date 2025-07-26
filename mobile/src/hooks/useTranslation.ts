/**
 * useTranslation Hook
 * React hook for internationalization
 */

import { useState, useEffect, useCallback } from 'react';
import { i18nService, SupportedLanguage, LanguageInfo } from '../services/i18nService';

interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  supportedLanguages: LanguageInfo[];
  isRTL: boolean;
  textDirection: 'ltr' | 'rtl';
  formatNumber: (number: number) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  fontFamily: string;
}

export const useTranslation = (): UseTranslationReturn => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    i18nService.getCurrentLanguage()
  );
  const [isRTL, setIsRTL] = useState(i18nService.isRTL());

  // Update state when language changes
  useEffect(() => {
    const unsubscribe = i18nService.addLanguageChangeListener((newLanguage) => {
      setCurrentLanguage(newLanguage);
      setIsRTL(i18nService.isRTL());
    });

    return unsubscribe;
  }, []);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    return i18nService.t(key, params);
  }, []);

  // Change language function
  const setLanguage = useCallback((language: SupportedLanguage): void => {
    i18nService.setLanguage(language);
  }, []);

  // Format number function
  const formatNumber = useCallback((number: number): string => {
    return i18nService.formatNumber(number);
  }, []);

  // Format date function
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return i18nService.formatDate(date, options);
  }, []);

  return {
    t,
    currentLanguage,
    setLanguage,
    supportedLanguages: i18nService.getSupportedLanguages(),
    isRTL,
    textDirection: i18nService.getTextDirection(),
    formatNumber,
    formatDate,
    fontFamily: i18nService.getFontFamily(),
  };
};