# Lab 9 – Data Integration and Manipulation with Kafka

**Subject:** SoA and Microservices  
**Teacher:** Dr. Salah Gontara  
**Class:** 4Info — AY: 2025/2026

---

## Architecture

```
Producer (producer.js)
    │  sends JSON event every second
    ▼
Kafka Broker (localhost:9092)  ←── topic: test-topic
    │
    ▼
Consumer (consumer.js)
    │  parses JSON + saves to DB
    ▼
PostgreSQL (kafka_messages table)
    │
    ▼
REST API (api.js)  ←── GET /messages, GET /messages/:id
```

---

## Project Structure

```
tp9-kafka/
├── producer.js     # Kafka producer — sends sensor events every second
├── consumer.js     # Kafka consumer — saves messages to PostgreSQL
├── api.js          # Express REST API — reads messages from DB
├── db.js           # PostgreSQL connection + table initialization
├── .env            # Environment variables (not committed)
├── .env.example    # Example environment variables
├── package.json
└── .gitignore
```

---

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Java 17+](https://adoptium.net/)
- [Kafka 4.2](https://kafka.apache.org/downloads) (`kafka_2.13-4.2.0`)
- [PostgreSQL](https://www.postgresql.org/)

---

## Step 1 — Setup Kafka (KRaft mode)

### On Windows:
```powershell
$KAFKA_CLUSTER_ID = (.\bin\windows\kafka-storage.bat random-uuid | Select-Object -Last 1)
.\bin\windows\kafka-storage.bat format --standalone -t $KAFKA_CLUSTER_ID -c .\config\server.properties
.\bin\windows\kafka-server-start.bat config\server.properties
```

### On Linux:
```bash
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
bin/kafka-storage.sh format --standalone -t "$KAFKA_CLUSTER_ID" -c config/server.properties
bin/kafka-server-start.sh config/server.properties
```

---

## Step 2 — Create Kafka Topic

### Windows:
```powershell
bin\windows\kafka-topics.bat --create --partitions 3 --replication-factor 1 --topic test-topic --bootstrap-server localhost:9092
```

### Linux:
```bash
bin/kafka-topics.sh --create --partitions 3 --replication-factor 1 --topic test-topic --bootstrap-server localhost:9092
```

---

## Step 3 — Setup PostgreSQL

Create a database named `kafka_db`:
```sql
CREATE DATABASE kafka_db;
```

The `kafka_messages` table is created automatically when the consumer or API starts.

---

## Step 4 — Configure Environment

Copy `.env.example` to `.env` and fill in your values:
```
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=test-topic

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kafka_db
DB_USER=postgres
DB_PASSWORD=yourpassword
```

---

## Step 5 — Install & Run

```bash
npm install
```

Open **3 separate terminals:**

**Terminal 1 – Consumer (must start before producer):**
```bash
npm run consumer
# or: node consumer.js
```

**Terminal 2 – Producer:**
```bash
npm run producer
# or: node producer.js
```

**Terminal 3 – REST API:**
```bash
npm run api
# or: node api.js
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | Get all messages from DB |
| GET | `/messages/:id` | Get a specific message by ID |

**Test with curl:**
```bash
curl http://localhost:3000/messages
curl http://localhost:3000/messages/1
```

**Test with Postman:**
- GET `http://localhost:3000/messages`
- GET `http://localhost:3000/messages/1`

---

## Database Schema

```sql
CREATE TABLE kafka_messages (
  id           SERIAL PRIMARY KEY,
  topic        VARCHAR(255),
  partition    INTEGER,
  offset_value BIGINT,
  key          VARCHAR(255),
  payload      JSONB,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

---

## Tools Used

- [KafkaJS](https://kafka.js.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL (pg)](https://node-postgres.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
