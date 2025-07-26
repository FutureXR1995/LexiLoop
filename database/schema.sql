-- LexiLoop Database Schema
-- PostgreSQL database schema for the vocabulary learning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced')),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'standard', 'professional', 'teacher')),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_subscription ON users(subscription_type);

-- Vocabularies table (master vocabulary database)
CREATE TABLE vocabularies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    pronunciation VARCHAR(200),
    part_of_speech VARCHAR(50),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    frequency_rank INTEGER,
    category VARCHAR(50),
    tags TEXT[],
    example_sentences TEXT[],
    synonyms TEXT[],
    antonyms TEXT[],
    etymology TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for vocabularies table
CREATE INDEX idx_vocabularies_word ON vocabularies(word);
CREATE INDEX idx_vocabularies_difficulty ON vocabularies(difficulty_level);
CREATE INDEX idx_vocabularies_category ON vocabularies(category);
CREATE INDEX idx_vocabularies_frequency ON vocabularies(frequency_rank);
CREATE INDEX idx_vocabularies_word_trgm ON vocabularies USING gin (word gin_trgm_ops);

-- Word books (collections of vocabulary words)
CREATE TABLE word_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Word book contents (many-to-many relationship)
CREATE TABLE word_book_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_book_id UUID NOT NULL REFERENCES word_books(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word_book_id, vocabulary_id)
);

-- Stories table (AI-generated stories)
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    title VARCHAR(200),
    vocabulary_ids UUID[] NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    story_type VARCHAR(50) DEFAULT 'general',
    word_count INTEGER NOT NULL,
    quality_score DECIMAL(3,2),
    audio_url VARCHAR(500),
    cache_key VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stories table
CREATE INDEX idx_stories_difficulty ON stories(difficulty_level);
CREATE INDEX idx_stories_story_type ON stories(story_type);
CREATE INDEX idx_stories_cache_key ON stories(cache_key);
CREATE INDEX idx_stories_vocabulary_ids ON stories USING gin(vocabulary_ids);
CREATE INDEX idx_stories_created_at ON stories(created_at);

-- Learning sessions table
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    word_book_id UUID REFERENCES word_books(id) ON DELETE SET NULL,
    vocabulary_ids UUID[] NOT NULL,
    session_type VARCHAR(50) DEFAULT 'story_learning',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_time_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    metadata JSONB DEFAULT '{}'
);

-- Test results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL, -- 'word_meaning', 'typing', 'comprehension'
    vocabulary_id UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    user_answer TEXT,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    attempts INTEGER DEFAULT 1,
    hints_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for test results
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_session ON test_results(learning_session_id);
CREATE INDEX idx_test_results_vocabulary ON test_results(vocabulary_id);
CREATE INDEX idx_test_results_type ON test_results(test_type);
CREATE INDEX idx_test_results_correct ON test_results(is_correct);

-- User progress table (tracks mastery of individual words)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    first_learned_at TIMESTAMP,
    last_reviewed_at TIMESTAMP,
    next_review_at TIMESTAMP,
    review_interval_hours INTEGER DEFAULT 24,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vocabulary_id)
);

-- Create indexes for user progress
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_vocabulary ON user_progress(vocabulary_id);
CREATE INDEX idx_user_progress_mastery ON user_progress(mastery_level);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review_at);

-- Error tracking table (for spaced repetition of wrong answers)
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    error_type VARCHAR(50) NOT NULL,
    error_context TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(200) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- System logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(200),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for system logs
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- AI generation costs tracking
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_type VARCHAR(50) NOT NULL, -- 'openai_generation', 'azure_tts'
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    request_details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabularies_updated_at BEFORE UPDATE ON vocabularies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_word_books_updated_at BEFORE UPDATE ON word_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.level,
    u.subscription_type,
    COUNT(DISTINCT ls.id) as total_sessions,
    COUNT(DISTINCT up.vocabulary_id) as words_learned,
    AVG(up.mastery_level) as avg_mastery,
    MAX(ls.completed_at) as last_activity
FROM users u
LEFT JOIN learning_sessions ls ON u.id = ls.user_id AND ls.status = 'completed'
LEFT JOIN user_progress up ON u.id = up.user_id AND up.mastery_level > 0
GROUP BY u.id, u.username, u.level, u.subscription_type;

-- Create view for vocabulary difficulty distribution
CREATE VIEW vocabulary_difficulty_stats AS
SELECT 
    difficulty_level,
    COUNT(*) as word_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM vocabularies 
GROUP BY difficulty_level 
ORDER BY difficulty_level;

-- Create view for story generation analytics
CREATE VIEW story_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    story_type,
    difficulty_level,
    COUNT(*) as stories_generated,
    AVG(quality_score) as avg_quality,
    AVG(word_count) as avg_word_count
FROM stories 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), story_type, difficulty_level
ORDER BY date DESC;