module.exports = async function (context, req) {
    context.log('Speech Synthesis API function processed a request.');

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
        const { text, voice, speed } = req.body || {};

        if (!text) {
            context.res = {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing text parameter' })
            };
            return;
        }

        // Real Azure Speech Services integration
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;
        
        if (!speechKey || !speechRegion) {
            context.res = {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Azure Speech Services not configured',
                    message: 'AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables are required'
                })
            };
            return;
        }

        try {
            // Create SSML for Azure Speech Services
            const voiceName = voice || 'zh-CN-XiaoxiaoNeural';
            const speechRate = speed ? `${parseFloat(speed) * 100}%` : '100%';
            
            const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
                <voice name="${voiceName}">
                    <prosody rate="${speechRate}">
                        ${text}
                    </prosody>
                </voice>
            </speak>`;

            // Call Azure Speech Services REST API
            const speechResponse = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': speechKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
                    'User-Agent': 'LexiLoop-TTS'
                },
                body: ssml
            });

            if (!speechResponse.ok) {
                throw new Error(`Azure Speech API error: ${speechResponse.status} ${speechResponse.statusText}`);
            }

            const audioBuffer = await speechResponse.arrayBuffer();
            const audioData = Buffer.from(audioBuffer);

            context.res = {
                status: 200,
                headers: { 
                    'Content-Type': 'audio/wav',
                    'Content-Disposition': 'attachment; filename="speech.wav"',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Length': audioData.length.toString()
                },
                body: audioData
            };

        } catch (speechError) {
            context.log.error('Azure Speech Services error:', speechError);
            
            context.res = {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Azure Speech Services call failed',
                    details: speechError.message
                })
            };
            return;
        }
    } catch (error) {
        context.log.error('Speech synthesis error:', error);
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