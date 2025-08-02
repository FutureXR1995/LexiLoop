module.exports = async function (context, req) {
    context.log('Environment test API called');

    const envVars = {
        CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? '***configured***' : 'NOT_SET',
        AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY ? '***configured***' : 'NOT_SET',
        AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION || 'NOT_SET',
        DATABASE_URL: process.env.DATABASE_URL ? '***configured***' : 'NOT_SET',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***configured***' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    };

    context.res = {
        status: 200,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Environment variable status',
            variables: envVars,
            timestamp: new Date().toISOString()
        })
    };
};