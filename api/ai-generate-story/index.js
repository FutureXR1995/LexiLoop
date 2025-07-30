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

        // Real Claude API integration
        const claudeApiKey = process.env.CLAUDE_API_KEY;
        
        if (!claudeApiKey) {
            context.res = {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Claude API key not configured',
                    message: 'CLAUDE_API_KEY environment variable is required'
                })
            };
            return;
        }

        // Create prompt for Claude
        const prompt = `Create an engaging ${genre || 'adventure'} story suitable for ${level || 'intermediate'} language learners. The story should be approximately ${length || 100} words long and naturally incorporate these vocabulary words: ${words.join(', ')}.

Requirements:
- Use each vocabulary word at least once in a natural context
- Write at an appropriate difficulty level for ${level || 'intermediate'} learners
- Make the story interesting and educational
- Use clear, simple language structure
- Include the vocabulary words in **bold** when they appear

Vocabulary words to include: ${words.join(', ')}`;

        let story;
        
        try {
            // Call Claude API
            const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeApiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 500,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!claudeResponse.ok) {
                throw new Error(`Claude API error: ${claudeResponse.status} ${claudeResponse.statusText}`);
            }

            const claudeData = await claudeResponse.json();
            story = claudeData.content[0].text;

        } catch (claudeError) {
            context.log.error('Claude API error:', claudeError);
            
            // Fallback to template story if Claude API fails
            story = `# ${genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : 'Adventure'} Story

Once upon a time, there was a young explorer who discovered the magic of learning. 

In their journey, they encountered many wonderful things: an **${words[0]}** that glowed with wisdom, the power of **${words[1] || 'friendship'}** that connected hearts across languages, and thrilling **${words[2] || 'adventures'}** that taught valuable lessons.

The explorer learned that with patience and curiosity, any language could be mastered. Each word was like a key that unlocked new worlds of understanding.

**Words featured in this story:**
${words.map(word => `• ${word.charAt(0).toUpperCase() + word.slice(1)}`).join('\n')}

*Note: This is a fallback story. Claude API integration failed: ${claudeError.message}*`;
        }

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