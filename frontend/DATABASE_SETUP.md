# Database Setup Guide

This guide will help you set up the PostgreSQL database for LexiLoop.

## Prerequisites

- PostgreSQL 14+ installed
- Node.js 18+ and npm
- Git

## Quick Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE lexiloop;
CREATE USER lexiloop_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lexiloop TO lexiloop_user;
\q
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your database credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database
DATABASE_URL="postgresql://lexiloop_user:your_secure_password@localhost:5432/lexiloop?schema=public"

# Add your API keys
NEXT_PUBLIC_SPEECH_API_KEY=your_azure_speech_key_here
CLAUDE_API_KEY=your_claude_api_key_here
NEXTAUTH_SECRET=your-secure-nextauth-secret
JWT_SECRET=your-secure-jwt-secret
```

### 4. Install Dependencies and Setup Database

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

## Database Schema Overview

The database includes the following main entities:

### Users
- User authentication and profiles
- Learning preferences and progress tracking
- User-specific vocabulary collections

### Vocabulary System
- **Collections**: Word books/collections (public and private)
- **Words**: Individual vocabulary words with definitions, pronunciation, examples
- **UserWords**: User-specific learning progress for each word

### Learning System
- **Stories**: AI-generated reading content
- **TestSessions**: Vocabulary tests and assessments
- **TestQuestions**: Individual test questions with user responses
- **LearningProgress**: Daily learning statistics
- **ErrorReviews**: Wrong answers for review and practice

### Features
- **Spaced Repetition**: Algorithm-based word review scheduling
- **Progress Tracking**: Detailed learning analytics
- **Achievement System**: Gamification elements
- **Multi-level Content**: Beginner, Intermediate, Advanced

## Available Scripts

```bash
# Database management
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Create and run migrations
npm run db:seed       # Populate with sample data
npm run db:studio     # Open Prisma Studio (GUI)
npm run db:reset      # Reset database and reseed

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

## Sample Data

After running `npm run db:seed`, you'll have:

### Test Accounts
- **Beginner**: `test@lexiloop.com` / `password123`
- **Advanced**: `advanced@lexiloop.com` / `password123`

### Sample Collections
- Essential English Words (Beginner)
- Business English (Intermediate) 
- Academic Vocabulary (Advanced)

### Sample Content
- Pre-generated stories with vocabulary
- Test sessions and questions
- Learning progress history
- Error review examples

## Database Management

### View Data
```bash
npm run db:studio
```
This opens Prisma Studio at `http://localhost:5555` where you can browse and edit data.

### Reset Database
```bash
npm run db:reset
```
This will drop all data, recreate schema, and reseed with sample data.

### Backup Database
```bash
pg_dump -U lexiloop_user -h localhost lexiloop > backup.sql
```

### Restore Database
```bash
psql -U lexiloop_user -h localhost lexiloop < backup.sql
```

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="strong-random-secret"
NEXTAUTH_SECRET="another-strong-secret"
```

### Migration Commands
```bash
# Generate Prisma client
npm run db:generate

# Deploy migrations
npx prisma migrate deploy

# Seed production data (optional)
npm run db:seed
```

## Troubleshooting

### Connection Issues
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env.local`
3. Check firewall/network settings

### Permission Errors
```bash
# Grant all privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lexiloop TO lexiloop_user;"
```

### Schema Issues
```bash
# Reset and recreate schema
npm run db:reset
```

### Performance Optimization
The schema includes optimized indexes for:
- User lookups by email/username
- Word searches within collections
- Progress queries by date ranges
- Test result aggregations

## API Endpoints

With the database set up, these API endpoints are available:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `DELETE /api/auth/login` - Logout

### Users
- `GET /api/users?id={userId}` - Get user profile
- `PUT /api/users` - Update user profile

### Vocabulary
- `GET /api/vocabulary/collections` - Get collections
- `POST /api/vocabulary/collections` - Create collection
- `GET /api/vocabulary/words` - Get words in collection
- `POST /api/vocabulary/words` - Add words to collection

### Progress & Analytics
- Progress tracking through user interactions
- Automated daily statistics
- Spaced repetition scheduling

## Next Steps

1. **Test the API endpoints** using curl or Postman
2. **Integrate with frontend components** to use real data
3. **Set up production database** on your hosting platform
4. **Configure monitoring** for database performance
5. **Set up automated backups** for production

The database is now ready for development and testing! 🎉