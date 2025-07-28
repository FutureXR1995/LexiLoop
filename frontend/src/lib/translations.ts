/**
 * Translation System for LexiLoop
 * Simple translations for UI text
 */

import { Locale } from './i18n';

export interface Translations {
  // Navigation
  nav: {
    learn: string;
    library: string;
    progress: string;
    advancedTests: string;
    social: string;
    login: string;
    profile: string;
  };
  
  // Common UI
  common: {
    welcome: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
  };
  
  // Home page
  home: {
    title: string;
    subtitle: string;
    getStarted: string;
    features: {
      aiGenerated: string;
      aiGeneratedDesc: string;
      immersiveReading: string;
      immersiveReadingDesc: string;
      vocabularyTracking: string;
      vocabularyTrackingDesc: string;
    };
  };
  
  // Language selection
  language: {
    choose: string;
    current: string;
  };
}

const translations: Record<Locale, Translations> = {
  'zh-CN': {
    nav: {
      learn: '学习',
      library: '词汇库',
      progress: '进度',
      advancedTests: '高级测试',
      social: '社区',
      login: '登录',
      profile: '个人资料',
    },
    common: {
      welcome: '欢迎',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      back: '返回',
      next: '下一步',
      previous: '上一步',
    },
    home: {
      title: 'LexiLoop - 智能词汇学习平台',
      subtitle: '通过AI生成的故事和沉浸式阅读体验来学习词汇',
      getStarted: '开始学习',
      features: {
        aiGenerated: 'AI生成故事',
        aiGeneratedDesc: '根据您的学习水平定制个性化故事',
        immersiveReading: '沉浸式阅读',
        immersiveReadingDesc: '通过互动阅读体验学习新词汇',
        vocabularyTracking: '词汇追踪',
        vocabularyTrackingDesc: '跟踪您的学习进度和掌握情况',
      },
    },
    language: {
      choose: '选择语言',
      current: '当前语言',
    },
  },
  
  'zh-TW': {
    nav: {
      learn: '學習',
      library: '詞彙庫',
      progress: '進度',
      advancedTests: '高級測試',
      social: '社群',
      login: '登入',
      profile: '個人資料',
    },
    common: {
      welcome: '歡迎',
      loading: '載入中...',
      error: '錯誤',
      success: '成功',
      cancel: '取消',
      confirm: '確認',
      save: '儲存',
      delete: '刪除',
      edit: '編輯',
      back: '返回',
      next: '下一步',
      previous: '上一步',
    },
    home: {
      title: 'LexiLoop - 智能詞彙學習平台',
      subtitle: '透過AI生成的故事和沉浸式閱讀體驗來學習詞彙',
      getStarted: '開始學習',
      features: {
        aiGenerated: 'AI生成故事',
        aiGeneratedDesc: '根據您的學習水平定制個人化故事',
        immersiveReading: '沉浸式閱讀',
        immersiveReadingDesc: '透過互動閱讀體驗學習新詞彙',
        vocabularyTracking: '詞彙追蹤',
        vocabularyTrackingDesc: '追蹤您的學習進度和掌握情況',
      },
    },
    language: {
      choose: '選擇語言',
      current: '目前語言',
    },
  },
  
  'ja-JP': {
    nav: {
      learn: '学習',
      library: '語彙集',
      progress: '進捗',
      advancedTests: '上級テスト',
      social: 'ソーシャル',
      login: 'ログイン',
      profile: 'プロフィール',
    },
    common: {
      welcome: 'ようこそ',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
    },
    home: {
      title: 'LexiLoop - スマート語彙学習プラットフォーム',
      subtitle: 'AI生成のストーリーと没入型読書体験で語彙を学習',
      getStarted: '学習を始める',
      features: {
        aiGenerated: 'AI生成ストーリー',
        aiGeneratedDesc: 'あなたの学習レベルに合わせたパーソナライズされたストーリー',
        immersiveReading: '没入型読書',
        immersiveReadingDesc: 'インタラクティブな読書体験で新しい語彙を学習',
        vocabularyTracking: '語彙追跡',
        vocabularyTrackingDesc: '学習進度と習得状況を追跡',
      },
    },
    language: {
      choose: '言語を選択',
      current: '現在の言語',
    },
  },
  
  'ko-KR': {
    nav: {
      learn: '학습',
      library: '어휘집',
      progress: '진도',
      advancedTests: '고급 테스트',
      social: '소셜',
      login: '로그인',
      profile: '프로필',
    },
    common: {
      welcome: '환영합니다',
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      back: '뒤로',
      next: '다음',
      previous: '이전',
    },
    home: {
      title: 'LexiLoop - 스마트 어휘 학습 플랫폼',
      subtitle: 'AI 생성 스토리와 몰입형 독서 경험으로 어휘 학습',
      getStarted: '학습 시작',
      features: {
        aiGenerated: 'AI 생성 스토리',
        aiGeneratedDesc: '학습 수준에 맞춘 개인화된 스토리',
        immersiveReading: '몰입형 독서',
        immersiveReadingDesc: '인터랙티브 독서 경험으로 새로운 어휘 학습',
        vocabularyTracking: '어휘 추적',
        vocabularyTrackingDesc: '학습 진도와 습득 상황을 추적',
      },
    },
    language: {
      choose: '언어 선택',
      current: '현재 언어',
    },
  },
  
  'vi-VN': {
    nav: {
      learn: 'Học tập',
      library: 'Thư viện từ vựng',
      progress: 'Tiến độ',
      advancedTests: 'Bài kiểm tra nâng cao',
      social: 'Cộng đồng',
      login: 'Đăng nhập',
      profile: 'Hồ sơ',
    },
    common: {
      welcome: 'Chào mừng',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      save: 'Lưu',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      back: 'Quay lại',
      next: 'Tiếp theo',
      previous: 'Trước đó',
    },
    home: {
      title: 'LexiLoop - Nền tảng học từ vựng thông minh',
      subtitle: 'Học từ vựng qua câu chuyện AI và trải nghiệm đọc sách nhập vai',
      getStarted: 'Bắt đầu học',
      features: {
        aiGenerated: 'Câu chuyện AI',
        aiGeneratedDesc: 'Câu chuyện được cá nhân hóa theo trình độ học tập của bạn',
        immersiveReading: 'Đọc sách nhập vai',
        immersiveReadingDesc: 'Học từ vựng mới qua trải nghiệm đọc tương tác',
        vocabularyTracking: 'Theo dõi từ vựng',
        vocabularyTrackingDesc: 'Theo dõi tiến độ học tập và tình trạng nắm vững',
      },
    },
    language: {
      choose: 'Chọn ngôn ngữ',
      current: 'Ngôn ngữ hiện tại',
    },
  },
  
  'en-US': {
    nav: {
      learn: 'Learn',
      library: 'Library',
      progress: 'Progress',
      advancedTests: 'Advanced Tests',
      social: 'Social',
      login: 'Login',
      profile: 'Profile',
    },
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
    home: {
      title: 'LexiLoop - Smart Vocabulary Learning Platform',
      subtitle: 'Learn vocabulary through AI-generated stories and immersive reading experiences',
      getStarted: 'Get Started',
      features: {
        aiGenerated: 'AI-Generated Stories',
        aiGeneratedDesc: 'Personalized stories tailored to your learning level',
        immersiveReading: 'Immersive Reading',
        immersiveReadingDesc: 'Learn new vocabulary through interactive reading experiences',
        vocabularyTracking: 'Vocabulary Tracking',
        vocabularyTrackingDesc: 'Track your learning progress and mastery',
      },
    },
    language: {
      choose: 'Choose Language',
      current: 'Current Language',
    },
  },
  
  'th-TH': {
    nav: {
      learn: 'เรียนรู้',
      library: 'คลังคำศัพท์',
      progress: 'ความก้าวหน้า',
      advancedTests: 'การทดสอบขั้นสูง',
      social: 'สังคม',
      login: 'เข้าสู่ระบบ',
      profile: 'โปรไฟล์',
    },
    common: {
      welcome: 'ยินดีต้อนรับ',
      loading: 'กำลังโหลด...',
      error: 'ข้อผิดพลาด',
      success: 'สำเร็จ',
      cancel: 'ยกเลิก',
      confirm: 'ยืนยัน',
      save: 'บันทึก',
      delete: 'ลบ',
      edit: 'แก้ไข',
      back: 'กลับ',
      next: 'ถัดไป',
      previous: 'ก่อนหน้า',
    },
    home: {
      title: 'LexiLoop - แพลตฟอร์มการเรียนรู้คำศัพท์อัจฉริยะ',
      subtitle: 'เรียนรู้คำศัพท์ผ่านเรื่องราวที่สร้างโดย AI และประสบการณ์การอ่านที่ดื่มด่ำ',
      getStarted: 'เริ่มเรียนรู้',
      features: {
        aiGenerated: 'เรื่องราวที่สร้างโดย AI',
        aiGeneratedDesc: 'เรื่องราวที่ปรับแต่งตามระดับการเรียนรู้ของคุณ',
        immersiveReading: 'การอ่านแบบดื่มด่ำ',
        immersiveReadingDesc: 'เรียนรู้คำศัพท์ใหม่ผ่านประสบการณ์การอ่านแบบโต้ตอบ',
        vocabularyTracking: 'การติดตามคำศัพท์',
        vocabularyTrackingDesc: 'ติดตามความก้าวหน้าและความเชี่ยวชาญในการเรียนรู้',
      },
    },
    language: {
      choose: 'เลือกภาษา',
      current: 'ภาษาปัจจุบัน',
    },
  },
  
  'ms-MY': {
    nav: {
      learn: 'Belajar',
      library: 'Perpustakaan',
      progress: 'Kemajuan',
      advancedTests: 'Ujian Lanjutan',
      social: 'Sosial',
      login: 'Log Masuk',
      profile: 'Profil',
    },
    common: {
      welcome: 'Selamat Datang',
      loading: 'Memuat...',
      error: 'Ralat',
      success: 'Berjaya',
      cancel: 'Batal',
      confirm: 'Sahkan',
      save: 'Simpan',
      delete: 'Padam',
      edit: 'Edit',
      back: 'Kembali',
      next: 'Seterusnya',
      previous: 'Sebelumnya',
    },
    home: {
      title: 'LexiLoop - Platform Pembelajaran Kosa Kata Pintar',
      subtitle: 'Pelajari kosa kata melalui cerita yang dijana AI dan pengalaman membaca yang mendalam',
      getStarted: 'Mula Belajar',
      features: {
        aiGenerated: 'Cerita Dijana AI',
        aiGeneratedDesc: 'Cerita yang disesuaikan dengan tahap pembelajaran anda',
        immersiveReading: 'Pembacaan Mendalam',
        immersiveReadingDesc: 'Pelajari kosa kata baru melalui pengalaman membaca interaktif',
        vocabularyTracking: 'Penjejakan Kosa Kata',
        vocabularyTrackingDesc: 'Jejaki kemajuan pembelajaran dan penguasaan anda',
      },
    },
    language: {
      choose: 'Pilih Bahasa',
      current: 'Bahasa Semasa',
    },
  },
  
  'id-ID': {
    nav: {
      learn: 'Belajar',
      library: 'Perpustakaan',
      progress: 'Kemajuan',
      advancedTests: 'Tes Lanjutan',
      social: 'Sosial',
      login: 'Masuk',
      profile: 'Profil',
    },
    common: {
      welcome: 'Selamat Datang',
      loading: 'Memuat...',
      error: 'Error',
      success: 'Berhasil',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      save: 'Simpan',
      delete: 'Hapus',
      edit: 'Edit',
      back: 'Kembali',
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
    },
    home: {
      title: 'LexiLoop - Platform Pembelajaran Kosakata Cerdas',
      subtitle: 'Pelajari kosakata melalui cerita yang dihasilkan AI dan pengalaman membaca yang imersif',
      getStarted: 'Mulai Belajar',
      features: {
        aiGenerated: 'Cerita Buatan AI',
        aiGeneratedDesc: 'Cerita yang dipersonalisasi sesuai tingkat pembelajaran Anda',
        immersiveReading: 'Membaca Imersif',
        immersiveReadingDesc: 'Pelajari kosakata baru melalui pengalaman membaca interaktif',
        vocabularyTracking: 'Pelacakan Kosakata',
        vocabularyTrackingDesc: 'Lacak kemajuan belajar dan penguasaan Anda',
      },
    },
    language: {
      choose: 'Pilih Bahasa',
      current: 'Bahasa Saat Ini',
    },
  },
  
  'tl-PH': {
    nav: {
      learn: 'Matuto',
      library: 'Aklatan',
      progress: 'Pag-unlad',
      advancedTests: 'Advanced na Pagsusulit',
      social: 'Panlipunan',
      login: 'Mag-login',
      profile: 'Profile',
    },
    common: {
      welcome: 'Maligayang Pagdating',
      loading: 'Naglo-load...',
      error: 'Mali',
      success: 'Tagumpay',
      cancel: 'Kanselahin',
      confirm: 'Kumpirmahin',
      save: 'I-save',
      delete: 'Tanggalin',
      edit: 'I-edit',
      back: 'Bumalik',
      next: 'Susunod',
      previous: 'Nakaraan',
    },
    home: {
      title: 'LexiLoop - Smart na Platform sa Pag-aaral ng Bokabularyo',
      subtitle: 'Matuto ng bokabularyo sa pamamagitan ng mga kwentong nilikha ng AI at mga karanasan sa pagbabasa na nakaka-engage',
      getStarted: 'Magsimula',
      features: {
        aiGenerated: 'Mga Kwentong Nilikha ng AI',
        aiGeneratedDesc: 'Mga kwentong naka-personalize ayon sa inyong antas ng pag-aaral',
        immersiveReading: 'Immersive na Pagbabasa',
        immersiveReadingDesc: 'Matuto ng bagong bokabularyo sa interactive na karanasan sa pagbabasa',
        vocabularyTracking: 'Pagsubaybay sa Bokabularyo',
        vocabularyTrackingDesc: 'Subaybayan ang inyong pag-unlad at husay sa pag-aaral',
      },
    },
    language: {
      choose: 'Pumili ng Wika',
      current: 'Kasalukuyang Wika',
    },
  },
};

// Hook for using translations
export function useTranslations(locale: Locale): Translations {
  return translations[locale] || translations['en-US'];
}

// Get translation for specific key (non-hook utility function)
export function getTranslation(locale: Locale, key: string): string {
  const t = translations[locale] || translations['en-US'];
  const keys = key.split('.');
  let value: any = t;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}