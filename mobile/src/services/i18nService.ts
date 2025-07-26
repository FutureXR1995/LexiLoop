/**
 * Internationalization Service
 * Multi-language support for mobile app
 */

import { Platform, NativeModules } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Language storage
const languageStorage = new MMKV({ id: 'language-settings' });

// Supported languages
export type SupportedLanguage = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

// Language configurations
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
  },
};

// Translation interface
export interface TranslationKeys {
  // Common
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    back: string;
    next: string;
    previous: string;
    done: string;
    close: string;
  };
  
  // Navigation
  navigation: {
    home: string;
    learn: string;
    progress: string;
    social: string;
    profile: string;
    settings: string;
  };
  
  // Authentication
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    createAccount: string;
    welcomeBack: string;
    loginSuccess: string;
    loginError: string;
    registerSuccess: string;
    registerError: string;
  };
  
  // Learning
  learning: {
    vocabulary: string;
    definition: string;
    example: string;
    pronunciation: string;
    difficulty: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    mastery: string;
    review: string;
    newWords: string;
    mixedPractice: string;
    startSession: string;
    sessionComplete: string;
    accuracy: string;
    timeSpent: string;
    wordsLearned: string;
    correctAnswers: string;
    incorrectAnswers: string;
  };
  
  // Voice features
  voice: {
    listen: string;
    practice: string;
    recording: string;
    playback: string;
    pronunciationAccuracy: string;
    youSaid: string;
    tryAgain: string;
    excellent: string;
    good: string;
    needsImprovement: string;
  };
  
  // Progress
  progress: {
    totalWords: string;
    masteredWords: string;
    inProgress: string;
    dayStreak: string;
    weeklyGoal: string;
    monthlyStats: string;
    achievements: string;
    leaderboard: string;
    rank: string;
    points: string;
  };
  
  // Offline features
  offline: {
    offlineMode: string;
    syncData: string;
    cacheSize: string;
    lastSync: string;
    downloadContent: string;
    clearCache: string;
    dataUsage: string;
    wifiOnly: string;
  };
  
  // Settings
  settings: {
    language: string;
    notifications: string;
    sounds: string;
    theme: string;
    privacy: string;
    about: string;
    version: string;
    support: string;
    rateApp: string;
    shareApp: string;
  };
  
  // Errors and messages
  messages: {
    networkError: string;
    loadingFailed: string;
    dataSaved: string;
    dataCleared: string;
    permissionDenied: string;
    featureUnavailable: string;
    tryAgainLater: string;
    noInternetConnection: string;
    syncInProgress: string;
    syncComplete: string;
    syncFailed: string;
  };
}

// Default English translations
const englishTranslations: TranslationKeys = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    done: 'Done',
    close: 'Close',
  },
  navigation: {
    home: 'Home',
    learn: 'Learn',
    progress: 'Progress',
    social: 'Social',
    profile: 'Profile',
    settings: 'Settings',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back!',
    loginSuccess: 'Login successful',
    loginError: 'Login failed',
    registerSuccess: 'Account created successfully',
    registerError: 'Registration failed',
  },
  learning: {
    vocabulary: 'Vocabulary',
    definition: 'Definition',
    example: 'Example',
    pronunciation: 'Pronunciation',
    difficulty: 'Difficulty',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    mastery: 'Mastery',
    review: 'Review',
    newWords: 'New Words',
    mixedPractice: 'Mixed Practice',
    startSession: 'Start Session',
    sessionComplete: 'Session Complete!',
    accuracy: 'Accuracy',
    timeSpent: 'Time Spent',
    wordsLearned: 'Words Learned',
    correctAnswers: 'Correct',
    incorrectAnswers: 'Incorrect',
  },
  voice: {
    listen: 'Listen',
    practice: 'Practice',
    recording: 'Recording...',
    playback: 'Playing...',
    pronunciationAccuracy: 'Pronunciation Accuracy',
    youSaid: 'You said',
    tryAgain: 'Try Again',
    excellent: 'Excellent!',
    good: 'Good!',
    needsImprovement: 'Needs Improvement',
  },
  progress: {
    totalWords: 'Total Words',
    masteredWords: 'Mastered',
    inProgress: 'In Progress',
    dayStreak: 'Day Streak',
    weeklyGoal: 'Weekly Goal',
    monthlyStats: 'Monthly Stats',
    achievements: 'Achievements',
    leaderboard: 'Leaderboard',
    rank: 'Rank',
    points: 'Points',
  },
  offline: {
    offlineMode: 'Offline Mode',
    syncData: 'Sync Data',
    cacheSize: 'Cache Size',
    lastSync: 'Last Sync',
    downloadContent: 'Download Content',
    clearCache: 'Clear Cache',
    dataUsage: 'Data Usage',
    wifiOnly: 'WiFi Only',
  },
  settings: {
    language: 'Language',
    notifications: 'Notifications',
    sounds: 'Sounds',
    theme: 'Theme',
    privacy: 'Privacy',
    about: 'About',
    version: 'Version',
    support: 'Support',
    rateApp: 'Rate App',
    shareApp: 'Share App',
  },
  messages: {
    networkError: 'Network connection error',
    loadingFailed: 'Failed to load data',
    dataSaved: 'Data saved successfully',
    dataCleared: 'Data cleared successfully',
    permissionDenied: 'Permission denied',
    featureUnavailable: 'Feature not available',
    tryAgainLater: 'Please try again later',
    noInternetConnection: 'No internet connection',
    syncInProgress: 'Syncing data...',
    syncComplete: 'Sync completed',
    syncFailed: 'Sync failed',
  },
};

// Chinese translations
const chineseTranslations: TranslationKeys = {
  common: {
    ok: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    retry: '重试',
    back: '返回',
    next: '下一个',
    previous: '上一个',
    done: '完成',
    close: '关闭',
  },
  navigation: {
    home: '首页',
    learn: '学习',
    progress: '进度',
    social: '社交',
    profile: '个人资料',
    settings: '设置',
  },
  auth: {
    login: '登录',
    register: '注册',
    logout: '登出',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    createAccount: '创建账户',
    welcomeBack: '欢迎回来！',
    loginSuccess: '登录成功',
    loginError: '登录失败',
    registerSuccess: '账户创建成功',
    registerError: '注册失败',
  },
  learning: {
    vocabulary: '词汇',
    definition: '定义',
    example: '例句',
    pronunciation: '发音',
    difficulty: '难度',
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    mastery: '掌握度',
    review: '复习',
    newWords: '新单词',
    mixedPractice: '混合练习',
    startSession: '开始学习',
    sessionComplete: '学习完成！',
    accuracy: '准确率',
    timeSpent: '学习时间',
    wordsLearned: '已学单词',
    correctAnswers: '正确',
    incorrectAnswers: '错误',
  },
  voice: {
    listen: '听听',
    practice: '练习',
    recording: '录音中...',
    playback: '播放中...',
    pronunciationAccuracy: '发音准确度',
    youSaid: '您说的是',
    tryAgain: '再试一次',
    excellent: '非常棒！',
    good: '很好！',
    needsImprovement: '需要改进',
  },
  progress: {
    totalWords: '总单词数',
    masteredWords: '已掌握',
    inProgress: '学习中',
    dayStreak: '连续天数',
    weeklyGoal: '本周目标',
    monthlyStats: '本月统计',
    achievements: '成就',
    leaderboard: '排行榜',
    rank: '排名',
    points: '积分',
  },
  offline: {
    offlineMode: '离线模式',
    syncData: '同步数据',
    cacheSize: '缓存大小',
    lastSync: '上次同步',
    downloadContent: '下载内容',
    clearCache: '清除缓存',
    dataUsage: '数据使用',
    wifiOnly: '仅WiFi',
  },
  settings: {
    language: '语言',
    notifications: '通知',
    sounds: '声音',
    theme: '主题',
    privacy: '隐私',
    about: '关于',
    version: '版本',
    support: '支持',
    rateApp: '评价应用',
    shareApp: '分享应用',
  },
  messages: {
    networkError: '网络连接错误',
    loadingFailed: '数据加载失败',
    dataSaved: '数据保存成功',
    dataCleared: '数据清除成功',
    permissionDenied: '权限被拒绝',
    featureUnavailable: '功能不可用',
    tryAgainLater: '请稍后重试',
    noInternetConnection: '无网络连接',
    syncInProgress: '数据同步中...',
    syncComplete: '同步完成',
    syncFailed: '同步失败',
  },
};

// Translation storage
const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: englishTranslations,
  zh: chineseTranslations,
  // Other languages would use English as fallback for now
  es: englishTranslations,
  fr: englishTranslations,
  de: englishTranslations,
  ja: englishTranslations,
  ko: englishTranslations,
};

class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';
  private listeners: Array<(language: SupportedLanguage) => void> = [];

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Get saved language or device language
    const savedLanguage = languageStorage.getString('currentLanguage') as SupportedLanguage;
    const deviceLanguage = this.getDeviceLanguage();

    this.currentLanguage = 
      savedLanguage || 
      (this.isLanguageSupported(deviceLanguage) ? deviceLanguage : this.fallbackLanguage);

    console.log(`Initialized i18n with language: ${this.currentLanguage}`);
  }

  private getDeviceLanguage(): SupportedLanguage {
    const deviceLocale = Platform.select({
      ios: NativeModules.SettingsManager?.settings?.AppleLocale ||
           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
           'en-US',
      android: NativeModules.I18nManager?.localeIdentifier || 'en-US',
      default: 'en-US',
    });

    const languageCode = deviceLocale.split('-')[0] as SupportedLanguage;
    return this.isLanguageSupported(languageCode) ? languageCode : 'en';
  }

  private isLanguageSupported(language: string): language is SupportedLanguage {
    return Object.keys(SUPPORTED_LANGUAGES).includes(language);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get language info
   */
  getLanguageInfo(language?: SupportedLanguage): LanguageInfo {
    const lang = language || this.currentLanguage;
    return SUPPORTED_LANGUAGES[lang];
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageInfo[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  /**
   * Set current language
   */
  setLanguage(language: SupportedLanguage): void {
    if (!this.isLanguageSupported(language)) {
      console.warn(`Language ${language} is not supported, using fallback`);
      language = this.fallbackLanguage;
    }

    this.currentLanguage = language;
    languageStorage.set('currentLanguage', language);

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(language);
      } catch (error) {
        console.error('Language change listener error:', error);
      }
    });

    console.log(`Language changed to: ${language}`);
  }

  /**
   * Add language change listener
   */
  addLanguageChangeListener(listener: (language: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get translation by path
   */
  t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.');
    const currentTranslations = translations[this.currentLanguage];
    const fallbackTranslations = translations[this.fallbackLanguage];

    // Get translation from current language
    let translation = this.getNestedValue(currentTranslations, keys);

    // Fallback to default language if not found
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      translation = this.getNestedValue(fallbackTranslations, keys);
    }

    // Return key if no translation found
    if (!translation) {
      console.warn(`Translation not found for key: ${path}`);
      return path;
    }

    // Replace parameters if provided
    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }

  private getNestedValue(obj: any, keys: string[]): string | undefined {
    return keys.reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  private replaceParams(text: string, params: Record<string, string | number>): string {
    let result = text;
    
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return result;
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    return SUPPORTED_LANGUAGES[this.currentLanguage].rtl;
  }

  /**
   * Get text direction for styling
   */
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  /**
   * Format numbers according to current locale
   */
  formatNumber(number: number): string {
    try {
      const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 
                   this.currentLanguage === 'ja' ? 'ja-JP' :
                   this.currentLanguage === 'ko' ? 'ko-KR' :
                   `${this.currentLanguage}-${this.currentLanguage.toUpperCase()}`;
      
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format dates according to current locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 
                   this.currentLanguage === 'ja' ? 'ja-JP' :
                   this.currentLanguage === 'ko' ? 'ko-KR' :
                   `${this.currentLanguage}-${this.currentLanguage.toUpperCase()}`;
      
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get appropriate font family for current language
   */
  getFontFamily(): string {
    switch (this.currentLanguage) {
      case 'zh':
        return Platform.select({
          ios: 'PingFang SC',
          android: 'sans-serif',
          default: 'sans-serif',
        });
      case 'ja':
        return Platform.select({
          ios: 'Hiragino Sans',
          android: 'sans-serif',
          default: 'sans-serif',
        });
      case 'ko':
        return Platform.select({
          ios: 'Apple SD Gothic Neo',
          android: 'sans-serif',
          default: 'sans-serif',
        });
      default:
        return Platform.select({
          ios: 'San Francisco',
          android: 'Roboto',
          default: 'sans-serif',
        });
    }
  }
}

// Export singleton instance
export const i18nService = new I18nService();
export default i18nService;