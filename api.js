// api.js
require('dotenv').config();
const express = require('express');
const { pool, initDB } = require('./db');

const app = express();
app.use(express.json());

// GET all messages
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM kafka_messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET message by id
app.get('/messages/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM kafka_messages WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;

const start = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`REST API running on http://localhost:${port}`);
    console.log(`  GET /messages`);
    console.log(`  GET /messages/:id`);
  });
};

start().catch(console.error);
