// ============================================================
// V.A.U.L.T — Automatic Database Setup & Migrations Script
// Reads schema.sql and seed.sql and applies them via Node.js
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in server/.env');
    console.error('   Please paste your Neon connection string into server/.env first.');
    process.exit(1);
  }

  const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

  console.log('🚀 Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📄 Applying schema (schema.sql)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema tables, enums, triggers, and indexes created!');

    // Read seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    console.log('🌱 Seeding initial mission data (seed.sql)...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ Seed missions and character data inserted!');

    console.log('');
    console.log('🎉 Database initialization complete! V.A.U.L.T backend is 100% active.');
    console.log('');

  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
