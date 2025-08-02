module.exports = async function (context, req) {
    context.log('Deployment test API called');

    context.res = {
        status: 200,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Deployment test successful!',
            timestamp: new Date().toISOString(),
            version: 'v2025-08-02-14-45',
            success: true
        })
    };
};