const express = require('express');
const multer = require('multer');
const { Queue, Worker } = require('bullmq');
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');
const db = require('./db');

const app = express();
const upload = multer({ dest: 'uploads/' });

const connection = { host: '127.0.0.1', port: 6379 };

const mainQueue = new Queue('csv-splitter', { connection });
const insertQueue = new Queue('db-insertion', { connection });

const BATCH_SIZE = 1000;
new Worker('csv-splitter', async (job) => {
  const { filePath } = job.data;
  let batch = [];
  
  const stream = fs.createReadStream(filePath).pipe(parse({ columns: true }));

  for await (const row of stream) {
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await insertQueue.add('insert-batch', { rows: batch }, {
        removeOnComplete: true,
        removeOnFail: 1000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });

      batch = [];
    }
  }
  if (batch.length > 0) await insertQueue.add('insert-batch', { rows: batch });

  fs.unlinkSync(filePath);
}, { connection });

new Worker('db-insertion', async (job) => {
  const { rows } = job.data;

  // console.log(`[Worker] Processing batch of ${rows.length} rows...`);

  const formattedRows = rows.map(row => ({
    customer_id: row['Customer Id'],
    first_name: row['First Name'],
    last_name: row['Last Name'],
    company: row['Company'],
    city: row['City'],
    country: row['Country'],
    phone_1: row['Phone 1'],
    phone_2: row['Phone 2'],
    email: row['Email'],
    subscription_date: row['Subscription Date'],
    website: row['Website']
  }));

  try {
    await db('customers').insert(formattedRows);
  } catch (err) {
    console.error('[Worker] Error inserting batch:', err);
  }
}, { connection, concurrency: 5 });

app.get('/', (req, res) => res.send('Server is running!'));

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    await mainQueue.add('split-csv', { filePath: req.file.path });

    res.json({
      message: 'File received and processing started!',
      file: req.file.originalname,
      queueJobId: 'Check logs for progress'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));