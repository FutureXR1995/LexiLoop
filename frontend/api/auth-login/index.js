module.exports = async function (context, req) {
    context.log('Login API function processed a request.');

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            body: { error: 'Method not allowed' }
        };
        return;
    }

    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            context.res = {
                status: 400,
                body: { error: 'Missing email or password' }
            };
            return;
        }

        // 模拟登录验证
        if (email === 'test@lexiloop.com' && password === 'password123') {
            const user = {
                id: 'user_test_123',
                email,
                name: 'Test User',
                username: 'testuser',
                token: 'jwt_token_' + Date.now()
            };

            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: true,
                    message: '登录成功',
                    user
                }
            };
        } else {
            context.res = {
                status: 401,
                body: { 
                    error: '用户名或密码错误',
                    hint: 'Use test@lexiloop.com / password123'
                }
            };
        }
    } catch (error) {
        context.log.error('Login error:', error);
        context.res = {
            status: 500,
            body: { 
                error: 'Internal server error',
                details: error.message 
            }
        };
    }
};