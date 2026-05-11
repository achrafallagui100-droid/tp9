// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kafka_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Create table if it doesn't exist
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kafka_messages (
      id SERIAL PRIMARY KEY,
      topic VARCHAR(255),
      partition INTEGER,
      offset_value BIGINT,
      key VARCHAR(255),
      payload JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Database table kafka_messages ready.');
};

module.exports = { pool, initDB };
