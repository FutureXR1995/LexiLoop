/**
 * Simple test script for LexiLoop backend API
 * Tests basic API endpoints without external dependencies
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LexiLoop-Test-Client/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get Vocabularies',
    path: '/api/vocabularies',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get Word Books',
    path: '/api/word-books',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get User Progress',
    path: '/api/progress',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Generate Test Questions',
    path: '/api/tests/generate-questions',
    method: 'POST',
    data: {
      vocabularyIds: ['vocab1', 'vocab2'],
      testTypes: ['word_meaning']
    },
    expectedStatus: 200
  },
  {
    name: '404 Test',
    path: '/api/nonexistent',
    method: 'GET',
    expectedStatus: 404
  }
];

// Run tests
async function runTests() {
  console.log('🚀 LexiLoop Backend API Test Suite');
  console.log('=' .repeat(50));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  → ${test.method} ${test.path}`);
      
      const startTime = Date.now();
      const response = await makeRequest(test.path, test.method, test.data);
      const responseTime = Date.now() - startTime;
      
      const statusMatch = response.statusCode === test.expectedStatus;
      const hasData = response.data && typeof response.data === 'object';
      
      if (statusMatch) {
        console.log(`  ✅ Status: ${response.statusCode} (${responseTime}ms)`);
        
        if (hasData && response.data.success !== undefined) {
          console.log(`  📊 Response: ${response.data.success ? 'Success' : 'Error'}`);
          if (response.data.message) {
            console.log(`  💬 Message: ${response.data.message}`);
          }
        }
        
        passed++;
      } else {
        console.log(`  ❌ Status: Expected ${test.expectedStatus}, got ${response.statusCode}`);
        console.log(`  📄 Response: ${JSON.stringify(response.data, null, 2)}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }
    
    console.log();
  }

  // Summary
  console.log('📊 Test Results Summary');
  console.log('-'.repeat(30));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log();

  if (failed === 0) {
    console.log('🎉 All tests passed! Backend API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server logs.');
  }
  
  console.log('=' .repeat(50));
}

// Check if server is running first
async function checkServer() {
  try {
    console.log('🔍 Checking if backend server is running...');
    await makeRequest('/health');
    console.log('✅ Server is running, starting tests...');
    console.log();
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running!');
    console.log('💡 Please start the server first:');
    console.log('   cd backend && npm run dev');
    console.log();
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);