// ============================================================
// V.A.U.L.T — PostgreSQL Connection Pool
// ============================================================

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;

const isRemoteDb = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('localhost') && 
  !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20,                      // max concurrent connections
  idleTimeoutMillis: 30000,     // close idle connections after 30s
  connectionTimeoutMillis: 10000 // timeout after 10s if cannot connect
});

// Log pool connection events in development
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB] New client connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Execute a parameterized query.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Get a dedicated client from the pool for transactions.
 * IMPORTANT: Always call client.release() when done.
 * @returns {Promise<pg.PoolClient>}
 */
export const getClient = () => {
  return pool.connect();
};

/**
 * Execute multiple queries in a transaction.
 * @param {Function} callback - async function receiving (client) 
 * @returns {Promise<any>} result of the callback
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Test the database connection.
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log(`[DB] Connected to PostgreSQL at ${result.rows[0].current_time}`);
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
};

export default pool;
