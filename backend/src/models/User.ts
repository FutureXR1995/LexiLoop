import mongoose, { Document, Schema } from 'mongoose';

// 用户接口
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: {
    language: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dailyGoal: number;
    notifications: {
      email: boolean;
      push: boolean;
      reminders: boolean;
    };
    learningMode: 'adaptive' | 'standard' | 'intensive';
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
    features: string[];
  };
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  learningStats: {
    totalWordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    totalStudyTime: number; // 分钟
    averageAccuracy: number;
    lastStudyDate?: Date;
  };
  achievements: string[];
  comparePassword(password: string): Promise<boolean>;
}

// 用户Schema
const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    dailyGoal: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    learningMode: {
      type: String,
      enum: ['adaptive', 'standard', 'intensive'],
      default: 'adaptive'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    features: [{
      type: String
    }]
  },
  profile: {
    bio: {
      type: String,
      maxlength: 500
    },
    location: {
      type: String,
      maxlength: 100
    },
    website: {
      type: String,
      maxlength: 200
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  learningStats: {
    totalWordsLearned: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastStudyDate: {
      type: Date,
      default: null
    }
  },
  achievements: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// 索引
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// 中间件 - 密码比较
import bcrypt from 'bcryptjs';

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// 预保存中间件 - 密码哈希
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 虚拟属性
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

UserSchema.virtual('isSubscribed').get(function() {
  return this.subscription.plan !== 'free' && 
         this.subscription.status === 'active' &&
         (!this.subscription.expiresAt || this.subscription.expiresAt > new Date());
});

export const User = mongoose.model<IUser>('User', UserSchema);