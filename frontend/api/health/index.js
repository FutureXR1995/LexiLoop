module.exports = async function (context, req) {
    context.log('Health API function processed a request.');

    try {
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
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(health)
        };
    } catch (error) {
        context.log.error('Health check error:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};