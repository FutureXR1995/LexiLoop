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

        // 模拟语音合成响应
        // 在实际应用中，这里会调用Azure Speech Services
        const synthesisResult = {
            success: true,
            message: '语音合成功能需要Azure Speech Services API密钥配置',
            parameters: {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                voice: voice || 'zh-CN-XiaoxiaoNeural',
                speed: speed || '1.0',
                format: 'audio/wav'
            },
            note: '这是模拟响应。实际部署需要配置AZURE_SPEECH_KEY和AZURE_SPEECH_REGION'
        };

        // 模拟返回一个小的音频文件头（实际应用中返回真实音频）
        const dummyWavHeader = Buffer.from([
            0x52, 0x49, 0x46, 0x46, // "RIFF"
            0x24, 0x00, 0x00, 0x00, // File size
            0x57, 0x41, 0x56, 0x45, // "WAVE"
            0x66, 0x6D, 0x74, 0x20, // "fmt "
            0x10, 0x00, 0x00, 0x00, // Format chunk size
            0x01, 0x00, 0x01, 0x00, // Audio format, channels
            0x44, 0xAC, 0x00, 0x00, // Sample rate
            0x88, 0x58, 0x01, 0x00, // Byte rate
            0x02, 0x00, 0x10, 0x00, // Block align, bits per sample
            0x64, 0x61, 0x74, 0x61, // "data"
            0x00, 0x00, 0x00, 0x00  // Data size
        ]);

        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'audio/wav',
                'Content-Disposition': 'attachment; filename="speech.wav"',
                'Access-Control-Allow-Origin': '*'
            },
            body: dummyWavHeader
        };
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