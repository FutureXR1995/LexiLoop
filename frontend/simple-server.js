const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>LexiLoop Test</title></head>
      <body>
        <h1>🎉 LexiLoop Server Test</h1>
        <p>If you can see this, the server is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Port: 3003</p>
      </body>
    </html>
  `);
});

server.listen(3003, '0.0.0.0', () => {
  console.log('🚀 Simple test server running on:');
  console.log('   Local:   http://localhost:3003');
  console.log('   Network: http://0.0.0.0:3003');
  console.log('');
  console.log('If this works but Next.js doesn\'t, there may be a Next.js specific issue.');
});