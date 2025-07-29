module.exports = async function (context, req) {
    context.log('AI Story Generation API function processed a request.');

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
        const { words, level, genre, length } = req.body || {};

        if (!words || !Array.isArray(words) || words.length === 0) {
            context.res = {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing or empty words array' })
            };
            return;
        }

        // 模拟AI故事生成 (实际应用中会调用Claude API)
        const wordList = words.join(', ');
        const story = `# Adventure Story

Once upon a time, there was a young explorer who discovered the magic of learning. 

In their journey, they encountered many wonderful things: an **${words[0]}** that glowed with wisdom, the power of **${words[1] || 'friendship'}** that connected hearts across languages, and thrilling **${words[2] || 'adventures'}** that taught valuable lessons.

The explorer learned that with patience and curiosity, any language could be mastered. Each word was like a key that unlocked new worlds of understanding.

**Words featured in this story:**
${words.map(word => `• ${word.charAt(0).toUpperCase() + word.slice(1)}`).join('\n')}

**Learning Level:** ${level || 'intermediate'}
**Genre:** ${genre || 'adventure'}
**Length:** ${length || 'short'}

*This story was generated to help you learn these vocabulary words in context. Practice using them in your own sentences!*`;

        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                story,
                metadata: {
                    wordsUsed: words,
                    level,
                    genre,
                    length,
                    generatedAt: new Date().toISOString()
                }
            })
        };
    } catch (error) {
        context.log.error('Story generation error:', error);
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