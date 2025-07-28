module.exports = async function (context, req) {
    context.log('Health API function processed a request.');

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        checks: {
            api: { status: 'healthy', message: 'API is running' },
            timestamp: { status: 'healthy', value: new Date().toISOString() }
        }
    };

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: health
    };
};