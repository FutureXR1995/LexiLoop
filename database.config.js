// Database configuration for Azure Static Web Apps
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'lexiloop_dev',
      user: 'postgres',
      password: 'password'
    },
    migrations: {
      directory: './frontend/prisma/migrations'
    }
  },
  
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './frontend/prisma/migrations'
    },
    ssl: {
      rejectUnauthorized: false
    }
  }
};