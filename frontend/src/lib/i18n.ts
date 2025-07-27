/**
 * Internationalization Configuration
 * Multi-language support for global LexiLoop users
 */

export const defaultLocale = 'ja-JP'; // 日本为主要市场

export const locales = [
  'ja-JP', // 日语 - 日本 (主要市场)
  'zh-CN', // 简体中文 - 中国大陆
  'zh-TW', // 繁体中文 - 台湾、香港、澳门
  'ko-KR', // 韩语 - 韩国
  'vi-VN', // 越南语 - 越南
  'en-US', // 英语 - 国际
  'th-TH', // 泰语 - 泰国 (可扩展)
  'ms-MY', // 马来语 - 马来西亚、新加坡 (可扩展)
  'id-ID', // 印尼语 - 印尼 (可扩展)
  'tl-PH', // 菲律宾语 - 菲律宾 (可扩展)
] as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  'ja-JP': '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ko-KR': '한국어',
  'vi-VN': 'Tiếng Việt',
  'en-US': 'English',
  'th-TH': 'ไทย',
  'ms-MY': 'Bahasa Melayu',
  'id-ID': 'Bahasa Indonesia',
  'tl-PH': 'Filipino',
};

export const localeFlags: Record<Locale, string> = {
  'ja-JP': '🇯🇵',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇭🇰', // 使用香港旗帜代表港澳台
  'ko-KR': '🇰🇷',
  'vi-VN': '🇻🇳',
  'en-US': '🌐', // 使用地球图标代表国际
  'th-TH': '🇹🇭',
  'ms-MY': '🇲🇾',
  'id-ID': '🇮🇩',
  'tl-PH': '🇵🇭',
};

// Region-specific configurations
export const regionConfigs = {
  'ja-JP': {
    currency: 'JPY',
    numberFormat: 'ja-JP',
    dateFormat: 'YYYY年MM月DD日',
    timeZone: 'Asia/Tokyo',
    rtl: false,
    speechRegion: 'japaneast',
  },
  'zh-CN': {
    currency: 'CNY',
    numberFormat: 'zh-CN',
    dateFormat: 'YYYY年MM月DD日',
    timeZone: 'Asia/Shanghai',
    rtl: false,
    speechRegion: 'chinanorth2',
  },
  'zh-TW': {
    currency: 'TWD',
    numberFormat: 'zh-TW',
    dateFormat: 'YYYY年MM月DD日',
    timeZone: 'Asia/Taipei',
    rtl: false,
    speechRegion: 'southeastasia',
  },
  'ko-KR': {
    currency: 'KRW',
    numberFormat: 'ko-KR',
    dateFormat: 'YYYY년 MM월 DD일',
    timeZone: 'Asia/Seoul',
    rtl: false,
    speechRegion: 'koreacentral',
  },
  'vi-VN': {
    currency: 'VND',
    numberFormat: 'vi-VN',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Ho_Chi_Minh',
    rtl: false,
    speechRegion: 'southeastasia',
  },
  'en-US': {
    currency: 'USD',
    numberFormat: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'America/New_York',
    rtl: false,
    speechRegion: 'eastus',
  },
  'th-TH': {
    currency: 'THB',
    numberFormat: 'th-TH',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Bangkok',
    rtl: false,
    speechRegion: 'southeastasia',
  },
  'ms-MY': {
    currency: 'MYR',
    numberFormat: 'ms-MY',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kuala_Lumpur',
    rtl: false,
    speechRegion: 'southeastasia',
  },
  'id-ID': {
    currency: 'IDR',
    numberFormat: 'id-ID',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Jakarta',
    rtl: false,
    speechRegion: 'southeastasia',
  },
  'tl-PH': {
    currency: 'PHP',
    numberFormat: 'tl-PH',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'Asia/Manila',
    rtl: false,
    speechRegion: 'southeastasia',
  },
};

// Detect user's preferred locale
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  // 1. Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get('lang') as Locale;
  if (urlLocale && locales.includes(urlLocale)) {
    return urlLocale;
  }
  
  // 2. Check localStorage
  const savedLocale = localStorage.getItem('preferred-locale') as Locale;
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale;
  }
  
  // 3. Check browser language
  const browserLang = navigator.language;
  const matchedLocale = locales.find(locale => 
    browserLang.startsWith(locale.split('-')[0])
  );
  
  if (matchedLocale) return matchedLocale;
  
  // 4. Detect by timezone (rough geo-location)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone.includes('Asia/Shanghai') || timeZone.includes('Asia/Hong_Kong')) {
    return 'zh-CN';
  }
  if (timeZone.includes('Asia/Taipei')) {
    return 'zh-TW';
  }
  if (timeZone.includes('Asia/Tokyo')) {
    return 'ja-JP';
  }
  if (timeZone.includes('Asia/Seoul')) {
    return 'ko-KR';
  }
  
  return defaultLocale;
}

// Save user's locale preference
export function saveLocalePreference(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale);
  }
}

// Format number according to locale
export function formatNumber(number: number, locale: Locale): string {
  const config = regionConfigs[locale];
  return new Intl.NumberFormat(config.numberFormat).format(number);
}

// Format currency according to locale
export function formatCurrency(amount: number, locale: Locale): string {
  const config = regionConfigs[locale];
  return new Intl.NumberFormat(config.numberFormat, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

// Format date according to locale
export function formatDate(date: Date, locale: Locale): string {
  const config = regionConfigs[locale];
  return new Intl.DateTimeFormat(config.numberFormat, {
    timeZone: config.timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Get appropriate Speech Services region
export function getSpeechRegion(locale: Locale): string {
  switch (locale) {
    case 'zh-CN':
      return 'chinanorth2'; // Azure China
    case 'zh-TW':
      return 'southeastasia'; // Singapore for Taiwan
    case 'ja-JP':
      return 'japaneast'; // Japan East
    case 'ko-KR':
      return 'koreacentral'; // Korea Central
    case 'en-US':
    default:
      return 'eastus'; // US East
  }
}

// Get appropriate AI model region
export function getAIRegion(locale: Locale): string {
  // Claude AI is available globally, but may have regional preferences
  switch (locale) {
    case 'zh-CN':
      return 'asia-pacific'; // Closest to China
    case 'ja-JP':
    case 'ko-KR':
      return 'asia-pacific'; // Asia Pacific region
    case 'zh-TW':
      return 'asia-pacific'; // Asia Pacific region
    case 'en-US':
    default:
      return 'us-east'; // US region
  }
}