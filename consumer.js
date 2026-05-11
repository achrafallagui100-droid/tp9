// consumer.js
require('dotenv').config();
const { Kafka } = require('kafkajs');
const { pool, initDB } = require('./db');

const kafka = new Kafka({
  clientId: 'tp9-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });
const topic = process.env.KAFKA_TOPIC || 'test-topic';

const run = async () => {
  // Initialize DB table
  await initDB();

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`Consumer connected. Listening to topic "${topic}"...`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const value = message.value?.toString();
      const offset = message.offset;

      console.log({ topic, partition, offset, key, value });

      // Parse JSON payload and save to database
      try {
        const payload = JSON.parse(value);

        await pool.query(
          `INSERT INTO kafka_messages (topic, partition, offset_value, key, payload)
           VALUES ($1, $2, $3, $4, $5)`,
          [topic, partition, offset, key, payload]
        );

        console.log(`Saved to DB: offset ${offset}`);
      } catch (err) {
        console.error('Error saving to DB:', err.message);
      }
    },
  });
};

run().catch(console.error);
