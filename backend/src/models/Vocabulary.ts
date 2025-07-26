import mongoose, { Document, Schema } from 'mongoose';

// 词汇接口
export interface IVocabulary extends Document {
  word: string;
  pronunciation?: string;
  phonetic?: string;
  partOfSpeech: string[];
  definitions: {
    meaning: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // 词频
  categories: string[];
  tags: string[];
  etymology?: string;
  audioUrl?: string;
  imageUrl?: string;
  relatedWords?: string[];
  usage: {
    formal: boolean;
    informal: boolean;
    academic: boolean;
    business: boolean;
    technical: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    viewCount: number;
    learnedCount: number;
    correctAnswers: number;
    totalAttempts: number;
    averageRating: number;
    ratingCount: number;
  };
}

// 词汇Schema
const VocabularySchema: Schema<IVocabulary> = new Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true
  },
  pronunciation: {
    type: String,
    trim: true
  },
  phonetic: {
    type: String,
    trim: true
  },
  partOfSpeech: [{
    type: String,
    required: true,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner']
  }],
  definitions: [{
    meaning: {
      type: String,
      required: true,
      trim: true
    },
    example: {
      type: String,
      trim: true
    },
    synonyms: [{
      type: String,
      trim: true
    }],
    antonyms: [{
      type: String,
      trim: true
    }]
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  frequency: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  categories: [{
    type: String,
    trim: true,
    index: true
  }],
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  etymology: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  relatedWords: [{
    type: String,
    trim: true
  }],
  usage: {
    formal: {
      type: Boolean,
      default: true
    },
    informal: {
      type: Boolean,
      default: false
    },
    academic: {
      type: Boolean,
      default: false
    },
    business: {
      type: Boolean,
      default: false
    },
    technical: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    learnedCount: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// 复合索引
VocabularySchema.index({ word: 1, difficulty: 1 });
VocabularySchema.index({ categories: 1, difficulty: 1 });
VocabularySchema.index({ tags: 1, isPublic: 1 });
VocabularySchema.index({ frequency: -1, difficulty: 1 });
VocabularySchema.index({ 'stats.learnedCount': -1 });
VocabularySchema.index({ createdBy: 1, isPublic: 1 });

// 文本搜索索引
VocabularySchema.index({
  word: 'text',
  'definitions.meaning': 'text',
  'definitions.example': 'text',
  categories: 'text',
  tags: 'text'
});

// 虚拟属性
VocabularySchema.virtual('accuracy').get(function() {
  return this.stats.totalAttempts > 0 
    ? (this.stats.correctAnswers / this.stats.totalAttempts) * 100 
    : 0;
});

VocabularySchema.virtual('popularity').get(function() {
  return this.stats.viewCount + (this.stats.learnedCount * 2);
});

export const Vocabulary = mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);