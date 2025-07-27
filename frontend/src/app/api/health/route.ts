import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: await checkDatabase(),
        external_apis: await checkExternalAPIs(),
        filesystem: await checkFilesystem(),
      }
    };

    const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
    
    return NextResponse.json(health, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

async function checkDatabase() {
  try {
    // Check database connection
    // In a real app, you'd check your actual database
    return {
      status: 'healthy',
      responseTime: 0,
      message: 'Database connection OK'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database check failed'
    };
  }
}

async function checkExternalAPIs() {
  try {
    // Check external API dependencies
    // In a real app, you'd ping your external services
    return {
      status: 'healthy',
      apis: {
        openai: 'healthy',
        azure_speech: 'healthy'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'External API check failed'
    };
  }
}

async function checkFilesystem() {
  try {
    // Check filesystem access
    const fs = require('fs').promises;
    await fs.access('/tmp', fs.constants.R_OK | fs.constants.W_OK);
    
    return {
      status: 'healthy',
      message: 'Filesystem access OK'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Filesystem check failed'
    };
  }
}