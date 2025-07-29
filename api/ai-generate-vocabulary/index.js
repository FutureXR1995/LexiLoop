module.exports = async function (context, req) {
    context.log('AI Vocabulary Generation API function processed a request.');

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
        return;
    }

    try {
        const { topic, level, count } = req.body || {};

        if (!topic) {
            context.res = {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing topic parameter' })
            };
            return;
        }

        // 模拟AI词汇生成
        const vocabularyWords = [
            {
                word: 'breakfast',
                definition: 'The first meal of the day',
                pronunciation: '/ˈbrɛkfəst/',
                partOfSpeech: 'noun',
                difficulty: level || 'beginner',
                examples: ['I eat breakfast at 7 AM.', 'Breakfast is the most important meal.'],
                tags: ['food', 'daily routine', 'meal']
            },
            {
                word: 'morning',
                definition: 'The early part of the day',
                pronunciation: '/ˈmɔrnɪŋ/',
                partOfSpeech: 'noun',
                difficulty: level || 'beginner',
                examples: ['Good morning!', 'I exercise every morning.'],
                tags: ['time', 'daily routine', 'greeting']
            },
            {
                word: 'kitchen',
                definition: 'A room where food is prepared',
                pronunciation: '/ˈkɪtʃən/',
                partOfSpeech: 'noun',
                difficulty: level || 'beginner',
                examples: ['She cooks in the kitchen.', 'The kitchen is very clean.'],
                tags: ['home', 'cooking', 'room']
            },
            {
                word: 'prepare',
                definition: 'To make something ready',
                pronunciation: '/prɪˈpɛr/',
                partOfSpeech: 'verb',
                difficulty: level || 'intermediate',
                examples: ['I prepare dinner every night.', 'Please prepare for the test.'],
                tags: ['action', 'cooking', 'planning']
            },
            {
                word: 'delicious',
                definition: 'Having a pleasant taste',
                pronunciation: '/dɪˈlɪʃəs/',
                partOfSpeech: 'adjective',
                difficulty: level || 'intermediate',
                examples: ['This cake is delicious!', 'She makes delicious soup.'],
                tags: ['food', 'taste', 'description']
            }
        ];

        const requestedCount = Math.min(count || 5, vocabularyWords.length);
        const selectedWords = vocabularyWords.slice(0, requestedCount);

        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                vocabulary: selectedWords,
                metadata: {
                    topic,
                    level: level || 'beginner',
                    count: requestedCount,
                    totalAvailable: vocabularyWords.length,
                    generatedAt: new Date().toISOString()
                }
            })
        };
    } catch (error) {
        context.log.error('Vocabulary generation error:', error);
        context.res = {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};