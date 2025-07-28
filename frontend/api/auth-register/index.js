module.exports = async function (context, req) {
    context.log('Register API function processed a request.');

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
        const { email, password, name, username } = req.body || {};

        if (!email || !password || !name) {
            context.res = {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields: email, password, name' })
            };
            return;
        }

        // 模拟用户注册成功
        const user = {
            id: 'user_' + Date.now(),
            email,
            name,
            username: username || email.split('@')[0],
            createdAt: new Date().toISOString(),
            verified: false
        };

        context.res = {
            status: 201,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                message: '用户注册成功',
                user
            })
        };
    } catch (error) {
        context.log.error('Registration error:', error);
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