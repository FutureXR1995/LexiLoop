module.exports = async function (context, req) {
    context.log('Vocabulary Words API function processed a request.');

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            body: { error: 'Method not allowed' }
        };
        return;
    }

    try {
        const { collectionId, words } = req.body || {};

        if (!collectionId || !words || !Array.isArray(words)) {
            context.res = {
                status: 400,
                body: { error: 'Missing collectionId or words array' }
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
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: true,
                message: `成功添加 ${addedWords.length} 个词汇`,
                words: addedWords,
                collectionId
            }
        };
    } catch (error) {
        context.log.error('Vocabulary words error:', error);
        context.res = {
            status: 500,
            body: { 
                error: 'Internal server error',
                details: error.message 
            }
        };
    }
};