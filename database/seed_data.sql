-- LexiLoop Seed Data
-- Initial data for development and testing

-- Insert sample vocabularies (basic words for testing)
INSERT INTO vocabularies (word, definition, pronunciation, part_of_speech, difficulty_level, frequency_rank, category, example_sentences, synonyms) VALUES
-- Beginner level (1)
('hello', 'A greeting used to acknowledge someone', '/həˈloʊ/', 'interjection', 1, 1, 'greetings', ARRAY['Hello, how are you?', 'She said hello to her friend.'], ARRAY['hi', 'greetings']),
('good', 'Having the right or desired qualities; satisfactory', '/ɡʊd/', 'adjective', 1, 2, 'descriptive', ARRAY['This is a good book.', 'She is a good student.'], ARRAY['excellent', 'great', 'fine']),
('water', 'A colorless, transparent liquid that forms rain, rivers, lakes, and seas', '/ˈwɔːtər/', 'noun', 1, 3, 'nature', ARRAY['I need to drink water.', 'The water is cold.'], ARRAY['H2O', 'liquid']),
('house', 'A building for human habitation', '/haʊs/', 'noun', 1, 4, 'home', ARRAY['I live in a big house.', 'The house has three bedrooms.'], ARRAY['home', 'dwelling', 'residence']),
('friend', 'A person you know well and like', '/frend/', 'noun', 1, 5, 'relationships', ARRAY['She is my best friend.', 'I met my friend at school.'], ARRAY['companion', 'buddy', 'pal']),

-- Elementary level (2)
('adventure', 'An exciting or remarkable experience', '/ədˈventʃər/', 'noun', 2, 100, 'activities', ARRAY['The trip was a great adventure.', 'He loves adventure stories.'], ARRAY['journey', 'expedition', 'quest']),
('mysterious', 'Full of mystery; difficult to understand', '/mɪˈstɪriəs/', 'adjective', 2, 150, 'descriptive', ARRAY['The old house looked mysterious.', 'She gave him a mysterious smile.'], ARRAY['enigmatic', 'puzzling', 'strange']),
('explore', 'To travel through an area to learn about it', '/ɪkˈsplɔːr/', 'verb', 2, 200, 'activities', ARRAY['Let''s explore the forest.', 'Scientists explore new theories.'], ARRAY['investigate', 'discover', 'examine']),
('discover', 'To find something for the first time', '/dɪˈskʌvər/', 'verb', 2, 250, 'activities', ARRAY['They discovered a new planet.', 'I discovered a great restaurant.'], ARRAY['find', 'uncover', 'reveal']),
('important', 'Having great significance or value', '/ɪmˈpɔːrtənt/', 'adjective', 2, 50, 'descriptive', ARRAY['This is an important meeting.', 'Education is important.'], ARRAY['significant', 'crucial', 'vital']),

-- Intermediate level (3)
('fascinating', 'Extremely interesting and captivating', '/ˈfæsəneɪtɪŋ/', 'adjective', 3, 500, 'descriptive', ARRAY['The documentary was fascinating.', 'She has a fascinating personality.'], ARRAY['captivating', 'intriguing', 'absorbing']),
('accomplish', 'To complete something successfully', '/əˈkʌmplɪʃ/', 'verb', 3, 600, 'achievement', ARRAY['She accomplished her goals.', 'We need to accomplish this task.'], ARRAY['achieve', 'complete', 'fulfill']),
('magnificent', 'Extremely beautiful and impressive', '/mæɡˈnɪfəsənt/', 'adjective', 3, 700, 'descriptive', ARRAY['The view was magnificent.', 'It''s a magnificent building.'], ARRAY['splendid', 'spectacular', 'impressive']),
('perspective', 'A way of thinking about something', '/pərˈspektɪv/', 'noun', 3, 800, 'thinking', ARRAY['From his perspective, it made sense.', 'Different perspectives are valuable.'], ARRAY['viewpoint', 'outlook', 'angle']),
('challenge', 'A difficult task that tests ability', '/ˈtʃæləndʒ/', 'noun', 3, 300, 'activities', ARRAY['This project is a real challenge.', 'She accepted the challenge.'], ARRAY['obstacle', 'difficulty', 'test']),

-- Upper-intermediate level (4)
('sophisticated', 'Complex and refined in design or manner', '/səˈfɪstəkeɪtəd/', 'adjective', 4, 1000, 'descriptive', ARRAY['The software is very sophisticated.', 'She has sophisticated taste.'], ARRAY['advanced', 'complex', 'refined']),
('contemporary', 'Belonging to or occurring in the present time', '/kənˈtempəreri/', 'adjective', 4, 1100, 'time', ARRAY['Contemporary art is controversial.', 'He studies contemporary history.'], ARRAY['modern', 'current', 'present-day']),
('substantial', 'Of considerable importance, size, or worth', '/səbˈstænʃəl/', 'adjective', 4, 1200, 'descriptive', ARRAY['There was substantial evidence.', 'She made a substantial donation.'], ARRAY['significant', 'considerable', 'major']),
('phenomenon', 'A remarkable or extraordinary event or fact', '/fəˈnɑːmənɑːn/', 'noun', 4, 1300, 'science', ARRAY['Lightning is a natural phenomenon.', 'The aurora is a beautiful phenomenon.'], ARRAY['occurrence', 'event', 'manifestation']),
('inevitable', 'Certain to happen; unavoidable', '/ɪnˈevətəbəl/', 'adjective', 4, 1400, 'certainty', ARRAY['Change is inevitable.', 'The outcome was inevitable.'], ARRAY['unavoidable', 'certain', 'inescapable']),

-- Advanced level (5)
('unprecedented', 'Never done or known before', '/ʌnˈpresəˌdentəd/', 'adjective', 5, 2000, 'uniqueness', ARRAY['This is an unprecedented situation.', 'The growth was unprecedented.'], ARRAY['unparalleled', 'extraordinary', 'unique']),
('philosophical', 'Relating to the study of fundamental nature of reality', '/ˌfɪləˈsɑːfəkəl/', 'adjective', 5, 2100, 'thinking', ARRAY['He asked a philosophical question.', 'She has a philosophical approach.'], ARRAY['theoretical', 'abstract', 'metaphysical']),
('quintessential', 'Representing the most perfect example of a quality', '/ˌkwɪntəˈsenʃəl/', 'adjective', 5, 2200, 'perfection', ARRAY['He''s the quintessential gentleman.', 'This is quintessential jazz music.'], ARRAY['perfect', 'ideal', 'archetypal']),
('serendipity', 'The pleasant surprise of finding something good while looking for something else', '/ˌserənˈdɪpəti/', 'noun', 5, 2300, 'luck', ARRAY['Meeting her was pure serendipity.', 'Scientific discoveries often involve serendipity.'], ARRAY['fortune', 'luck', 'chance']),
('ubiquitous', 'Present, appearing, or found everywhere', '/juːˈbɪkwətəs/', 'adjective', 5, 2400, 'presence', ARRAY['Smartphones are ubiquitous today.', 'The technology became ubiquitous.'], ARRAY['omnipresent', 'pervasive', 'widespread']);

-- Create sample word books
INSERT INTO word_books (name, description, category, difficulty_level, is_public, word_count) VALUES
('Essential Beginner Words', 'Core vocabulary for English language learners starting their journey', 'General', 1, true, 5),
('Adventure Stories Vocabulary', 'Words commonly used in adventure and exploration stories', 'Literature', 2, true, 5),
('Intermediate Expressions', 'Vocabulary for intermediate English learners', 'General', 3, true, 5),
('Advanced Academic Words', 'Sophisticated vocabulary for academic and professional contexts', 'Academic', 4, true, 5),
('Master Level Vocabulary', 'Challenging words for advanced English learners', 'Advanced', 5, true, 5);

-- Link vocabularies to word books
-- Beginner word book
INSERT INTO word_book_contents (word_book_id, vocabulary_id, order_index)
SELECT 
    (SELECT id FROM word_books WHERE name = 'Essential Beginner Words'),
    v.id,
    ROW_NUMBER() OVER (ORDER BY v.frequency_rank)
FROM vocabularies v 
WHERE v.difficulty_level = 1;

-- Adventure word book
INSERT INTO word_book_contents (word_book_id, vocabulary_id, order_index)
SELECT 
    (SELECT id FROM word_books WHERE name = 'Adventure Stories Vocabulary'),
    v.id,
    ROW_NUMBER() OVER (ORDER BY v.frequency_rank)
FROM vocabularies v 
WHERE v.difficulty_level = 2;

-- Intermediate word book
INSERT INTO word_book_contents (word_book_id, vocabulary_id, order_index)
SELECT 
    (SELECT id FROM word_books WHERE name = 'Intermediate Expressions'),
    v.id,
    ROW_NUMBER() OVER (ORDER BY v.frequency_rank)
FROM vocabularies v 
WHERE v.difficulty_level = 3;

-- Advanced word book
INSERT INTO word_book_contents (word_book_id, vocabulary_id, order_index)
SELECT 
    (SELECT id FROM word_books WHERE name = 'Advanced Academic Words'),
    v.id,
    ROW_NUMBER() OVER (ORDER BY v.frequency_rank)
FROM vocabularies v 
WHERE v.difficulty_level = 4;

-- Master word book
INSERT INTO word_book_contents (word_book_id, vocabulary_id, order_index)
SELECT 
    (SELECT id FROM word_books WHERE name = 'Master Level Vocabulary'),
    v.id,
    ROW_NUMBER() OVER (ORDER BY v.frequency_rank)
FROM vocabularies v 
WHERE v.difficulty_level = 5;

-- Create a test user (password: "testpassword123")
INSERT INTO users (email, password_hash, username, first_name, last_name, level, email_verified) VALUES
('test@lexiloop.com', '$2b$10$rOzKqYzRsKkHxKxhWBzKReGVAyFPqxOFPcjQWXsKjNxjPABnLNsrG', 'testuser', 'Test', 'User', 'intermediate', true);

-- Create sample stories (these would normally be AI-generated)
INSERT INTO stories (content, title, vocabulary_ids, difficulty_level, story_type, word_count, quality_score, cache_key) VALUES
(
    'Once upon a time, there lived a young explorer who dreamed of going on a great adventure. Every day, she would look at maps and imagine the mysterious places she could explore. One morning, she decided to discover what lay beyond the hills near her house. As she walked through the forest, she found beautiful flowers and heard strange sounds. This adventure taught her that the world is full of wonderful things waiting to be discovered.',
    'The Young Explorer',
    (SELECT ARRAY(SELECT id FROM vocabularies WHERE word IN ('adventure', 'mysterious', 'explore', 'discover', 'house'))),
    2,
    'adventure',
    80,
    0.85,
    'sample_story_1'
),
(
    'Learning new words can be a fascinating challenge that helps us accomplish great things. From a different perspective, each word we learn opens up new ways to express our thoughts and feelings. The magnificent power of language allows us to communicate complex ideas and connect with others in meaningful ways.',
    'The Power of Words',
    (SELECT ARRAY(SELECT id FROM vocabularies WHERE word IN ('fascinating', 'challenge', 'accomplish', 'perspective', 'magnificent'))),
    3,
    'educational',
    60,
    0.78,
    'sample_story_2'
);

-- Update word book word counts
UPDATE word_books SET word_count = (
    SELECT COUNT(*) FROM word_book_contents WHERE word_book_id = word_books.id
);

-- Insert some sample learning data for the test user
DO $$
DECLARE
    test_user_id UUID;
    vocab_record RECORD;
BEGIN
    -- Get test user ID
    SELECT id INTO test_user_id FROM users WHERE email = 'test@lexiloop.com';
    
    IF test_user_id IS NOT NULL THEN
        -- Create user progress for some vocabulary words
        FOR vocab_record IN 
            SELECT id FROM vocabularies WHERE difficulty_level <= 2 ORDER BY frequency_rank LIMIT 10
        LOOP
            INSERT INTO user_progress (
                user_id, 
                vocabulary_id, 
                mastery_level, 
                correct_count, 
                incorrect_count, 
                total_attempts,
                first_learned_at,
                last_reviewed_at,
                confidence_score
            ) VALUES (
                test_user_id,
                vocab_record.id,
                FLOOR(RANDOM() * 3) + 1, -- Random mastery level 1-3
                FLOOR(RANDOM() * 10) + 1, -- Random correct count
                FLOOR(RANDOM() * 3), -- Random incorrect count
                FLOOR(RANDOM() * 13) + 1, -- Random total attempts
                CURRENT_TIMESTAMP - INTERVAL '1 week',
                CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '1 day'),
                RANDOM() * 0.5 + 0.5 -- Random confidence 0.5-1.0
            );
        END LOOP;
    END IF;
END $$;