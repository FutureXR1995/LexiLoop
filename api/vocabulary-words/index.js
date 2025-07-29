module.exports = async function (context, req) {
    context.log('Vocabulary Words API function processed a request.');

    if (req.method === 'GET') {
        // Handle GET request - fetch vocabulary words
        try {
            const { limit = 20, difficulty = 2, search = '' } = req.query || {};
            
            // Sample vocabulary words for different difficulties
            const sampleWords = [
                { id: '1', word: 'adventure', definition: 'An exciting or remarkable experience', difficulty: 2, partOfSpeech: 'noun' },
                { id: '2', word: 'mysterious', definition: 'Full of mystery; difficult to understand', difficulty: 3, partOfSpeech: 'adjective' },
                { id: '3', word: 'explore', definition: 'To travel through an area to learn about it', difficulty: 2, partOfSpeech: 'verb' },
                { id: '4', word: 'discover', definition: 'To find something for the first time', difficulty: 2, partOfSpeech: 'verb' },
                { id: '5', word: 'fascinating', definition: 'Extremely interesting and captivating', difficulty: 3, partOfSpeech: 'adjective' },
                { id: '6', word: 'incredible', definition: 'Impossible to believe; extraordinary', difficulty: 3, partOfSpeech: 'adjective' },
                { id: '7', word: 'journey', definition: 'An act of traveling from one place to another', difficulty: 2, partOfSpeech: 'noun' },
                { id: '8', word: 'magnificent', definition: 'Impressively beautiful or elaborate', difficulty: 4, partOfSpeech: 'adjective' },
                { id: '9', word: 'challenge', definition: 'A task that tests someone\'s abilities', difficulty: 2, partOfSpeech: 'noun' },
                { id: '10', word: 'achievement', definition: 'A thing done successfully with effort', difficulty: 3, partOfSpeech: 'noun' },
                { id: '11', word: 'opportunity', definition: 'A set of circumstances that makes it possible to do something', difficulty: 4, partOfSpeech: 'noun' },
                { id: '12', word: 'experience', definition: 'Practical contact with and observation of facts or events', difficulty: 2, partOfSpeech: 'noun' },
                { id: '13', word: 'knowledge', definition: 'Facts, information, and skills acquired through experience or education', difficulty: 3, partOfSpeech: 'noun' },
                { id: '14', word: 'wisdom', definition: 'The quality of having experience, knowledge, and good judgment', difficulty: 4, partOfSpeech: 'noun' },
                { id: '15', word: 'curious', definition: 'Eager to know or learn something', difficulty: 2, partOfSpeech: 'adjective' },
                { id: '16', word: 'determined', definition: 'Having made a firm decision and being resolved not to change it', difficulty: 3, partOfSpeech: 'adjective' },
                { id: '17', word: 'perseverance', definition: 'Persistence in doing something despite difficulty or delay', difficulty: 5, partOfSpeech: 'noun' },
                { id: '18', word: 'creativity', definition: 'The use of imagination or original ideas to create something', difficulty: 4, partOfSpeech: 'noun' },
                { id: '19', word: 'innovation', definition: 'The action or process of innovating; a new method or idea', difficulty: 4, partOfSpeech: 'noun' },
                { id: '20', word: 'inspiration', definition: 'The process of being mentally stimulated to do or feel something creative', difficulty: 4, partOfSpeech: 'noun' }
            ];

            // Filter by difficulty and search term
            let filteredWords = sampleWords.filter(word => {
                const matchesDifficulty = word.difficulty <= parseInt(difficulty);
                const matchesSearch = search === '' || 
                    word.word.toLowerCase().includes(search.toLowerCase()) ||
                    word.definition.toLowerCase().includes(search.toLowerCase());
                return matchesDifficulty && matchesSearch;
            });

            // Limit results
            filteredWords = filteredWords.slice(0, parseInt(limit));

            context.res = {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    words: filteredWords,
                    total: filteredWords.length,
                    filters: { limit: parseInt(limit), difficulty: parseInt(difficulty), search }
                })
            };
        } catch (error) {
            context.log.error('Vocabulary words GET error:', error);
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
        return;
    }

    if (req.method === 'POST') {
        // Handle POST request - add vocabulary words to collection
        try {
            const { collectionId, words } = req.body || {};

            if (!collectionId || !words || !Array.isArray(words)) {
                context.res = {
                    status: 400,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Missing collectionId or words array' })
                };
                return;
            }

            // 模拟添加词汇到集合
            const addedWords = words.map((word, index) => ({
                id: `word_${Date.now()}_${index}`,
                collectionId,
                word: word.word,
                definition: word.definition,
                pronunciation: word.pronunciation,
                partOfSpeech: word.partOfSpeech,
                difficulty: word.difficulty,
                examples: word.examples || [],
                tags: word.tags || [],
                createdAt: new Date().toISOString()
            }));

            context.res = {
                status: 201,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: `成功添加 ${addedWords.length} 个词汇`,
                    words: addedWords,
                    collectionId
                })
            };
        } catch (error) {
            context.log.error('Vocabulary words POST error:', error);
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
        return;
    }

    // Method not allowed
    context.res = {
        status: 405,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Method not allowed. Only GET and POST are supported.' })
    };
};