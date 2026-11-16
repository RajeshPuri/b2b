-- PostgreSQL initialization script
-- Creates the b2b_platform database and b2b_user

-- Create the user (if not exists via Docker env)
-- The Dockerfile sets POSTGRES_USER and POSTGRES_PASSWORD env vars

-- Create the database
CREATE DATABASE b2b_platform;

-- Grant all privileges on database to user
GRANT ALL PRIVILEGES ON DATABASE b2b_platform TO b2b_user;

-- Connect to the database to set up schemas
\c b2b_platform

-- Create enum types needed for the schema
-- We'll create these as needed via Prisma migration, but set up basics here

-- Grant schema public permissions
GRANT CREATE ON SCHEMA public TO b2b_user;
GRANT USAGE ON SCHEMA public TO b2b_user;

-- Add comment
COMMENT ON DATABASE b2b_platform IS 'B2B Wholesale Marketplace Platform';