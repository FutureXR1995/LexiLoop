-- Initialize database extensions and basic setup
-- This file is run when the PostgreSQL container starts up

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log the initialization
INSERT INTO pg_stat_statements_info (name) 
VALUES ('LexiLoop database initialized at ' || CURRENT_TIMESTAMP) 
ON CONFLICT DO NOTHING;