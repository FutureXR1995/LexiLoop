module.exports = async function (context, req) {
    context.log('Vocabulary Collections API function processed a request.');

    try {
        if (req.method === 'GET') {
            // 获取词汇集合列表
            const collections = [
                {
                    id: 'collection_1',
                    title: '日常词汇',
                    description: '日常生活中常用的英语词汇',
                    category: 'daily',
                    level: 'BEGINNER',
                    isPublic: true,
                    wordCount: 25,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'collection_2',
                    title: '商务英语',
                    description: '商务场景中使用的专业词汇',
                    category: 'business',
                    level: 'INTERMEDIATE',
                    isPublic: true,
                    wordCount: 40,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            context.res = {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    collections,
                    total: collections.length
                })
            };
        } else if (req.method === 'POST') {
            // 创建新的词汇集合
            const { title, description, category, level, isPublic } = req.body || {};

            if (!title) {
                context.res = {
                    status: 400,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Missing title parameter' })
                };
                return;
            }

            const newCollection = {
                id: 'collection_' + Date.now(),
                title,
                description: description || '',
                category: category || 'general',
                level: level || 'BEGINNER',
                isPublic: isPublic !== false,
                wordCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            context.res = {
                status: 201,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: '词汇集合创建成功',
                    collection: newCollection
                })
            };
        } else {
            context.res = {
                status: 405,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }
    } catch (error) {
        context.log.error('Vocabulary collections error:', error);
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