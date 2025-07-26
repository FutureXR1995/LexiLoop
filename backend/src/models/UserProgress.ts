import mongoose, { Document, Schema } from 'mongoose';

// 用户学习进度接口
export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  vocabularyId: mongoose.Types.ObjectId;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // 学习统计
  stats: {
    totalAttempts: number;
    correctAttempts: number;
    consecutiveCorrect: number;
    lastAttemptCorrect: boolean;
    averageResponseTime: number; // 毫秒
    firstLearnedAt?: Date;
    lastReviewedAt?: Date;
  };
  
  // 间隔重复
  spacedRepetition: {
    easeFactor: number;
    interval: number; // 天数
    repetitions: number;
    nextReview: Date;
    quality: number; // 0-5 质量评分
  };
  
  // 学习模式记录
  learningModes: {
    flashcard: {
      attempts: number;
      correct: number;
      lastUsed?: Date;
    };
    typing: {
      attempts: number;
      correct: number;
      lastUsed?: Date;
    };
    listening: {
      attempts: number;
      correct: number;
      lastUsed?: Date;
    };
    speaking: {
      attempts: number;
      correct: number;
      lastUsed?: Date;
    };
  };
  
  // 错误记录
  errors: {
    type: 'spelling' | 'meaning' | 'pronunciation' | 'usage';
    count: number;
    lastOccurred?: Date;
    examples?: string[];
  }[];
  
  // 个人笔记
  notes?: string;
  bookmarks: {
    isBookmarked: boolean;
    bookmarkedAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema<IUserProgress> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vocabularyId: {
    type: Schema.Types.ObjectId,
    ref: 'Vocabulary',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['new', 'learning', 'reviewing', 'mastered'],
    default: 'new',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    consecutiveCorrect: {
      type: Number,
      default: 0
    },
    lastAttemptCorrect: {
      type: Boolean,
      default: false
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    firstLearnedAt: {
      type: Date
    },
    lastReviewedAt: {
      type: Date
    }
  },
  
  spacedRepetition: {
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
      max: 4.0
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    repetitions: {
      type: Number,
      default: 0
    },
    nextReview: {
      type: Date,
      default: Date.now,
      index: true
    },
    quality: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  
  learningModes: {
    flashcard: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      lastUsed: Date
    },
    typing: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      lastUsed: Date
    },
    listening: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      lastUsed: Date
    },
    speaking: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      lastUsed: Date
    }
  },
  
  errors: [{
    type: {
      type: String,
      enum: ['spelling', 'meaning', 'pronunciation', 'usage'],
      required: true
    },
    count: {
      type: Number,
      default: 1
    },
    lastOccurred: {
      type: Date,
      default: Date.now
    },
    examples: [String]
  }],
  
  notes: {
    type: String,
    maxlength: 1000
  },
  
  bookmarks: {
    isBookmarked: {
      type: Boolean,
      default: false
    },
    bookmarkedAt: Date
  }
}, {
  timestamps: true
});

// 复合索引
UserProgressSchema.index({ userId: 1, vocabularyId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ userId: 1, 'spacedRepetition.nextReview': 1 });
UserProgressSchema.index({ userId: 1, 'bookmarks.isBookmarked': 1 });
UserProgressSchema.index({ userId: 1, difficulty: 1, status: 1 });

// 虚拟属性
UserProgressSchema.virtual('accuracy').get(function() {
  return this.stats.totalAttempts > 0 
    ? (this.stats.correctAttempts / this.stats.totalAttempts) * 100 
    : 0;
});

UserProgressSchema.virtual('isOverdue').get(function() {
  return this.spacedRepetition.nextReview < new Date();
});

UserProgressSchema.virtual('strengthScore').get(function() {
  const accuracy = this.accuracy;
  const consistency = Math.min(this.stats.consecutiveCorrect / 5, 1) * 100;
  const recency = this.stats.lastReviewedAt 
    ? Math.max(0, 100 - ((Date.now() - this.stats.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24))) 
    : 0;
  
  return (accuracy * 0.5 + consistency * 0.3 + recency * 0.2);
});

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);