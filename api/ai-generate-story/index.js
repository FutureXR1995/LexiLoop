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
        
        // Debug: Log environment variable status
        context.log('Environment variables check:');
        context.log('CLAUDE_API_KEY exists:', !!claudeApiKey);
        context.log('CLAUDE_API_KEY length:', claudeApiKey ? claudeApiKey.length : 0);
        context.log('NODE_ENV:', process.env.NODE_ENV);
        
        // TEMPORARY DEBUG: Force return environment status instead of calling Claude
        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                debug: true,
                message: 'Environment variable debug info',
                claudeKeyExists: !!claudeApiKey,
                claudeKeyLength: claudeApiKey ? claudeApiKey.length : 0,
                claudeKeyPrefix: claudeApiKey ? claudeApiKey.substring(0, 10) + '...' : 'NOT_SET',
                nodeEnv: process.env.NODE_ENV,
                allEnvKeys: Object.keys(process.env).filter(k => k.includes('CLAUDE') || k.includes('AZURE') || k.includes('DATABASE')),
                timestamp: new Date().toISOString()
            })
        };
        return;
        
        if (!claudeApiKey) {
            context.res = {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Claude API key not configured',
                    message: 'CLAUDE_API_KEY environment variable is required',
                    debug: {
                        claudeKeyExists: !!claudeApiKey,
                        nodeEnv: process.env.NODE_ENV,
                        availableKeys: Object.keys(process.env).filter(k => k.includes('CLAUDE') || k.includes('API'))
                    }
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
            
            context.res = {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Claude API call failed',
                    details: claudeError.message,
                    success: false
                })
            };
            return;
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