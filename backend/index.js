const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const startStockWorker = require('./workers/stockWorker');
const startNewsWorker = require('./workers/newsWorker');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/news', require('./routes/newsRoute'));
app.use('/api/stocks', require('./routes/stockRoute'));

// Scheduled news fetching
const newsService = require('./services/newsService');
const schedule = require('node-schedule');

startNewsWorker();
startStockWorker();

// Fetch news every hour
schedule.scheduleJob('0 * * * *', async () => {
  console.log('Running scheduled news fetch...');
  await newsService.fetchAndStoreNews();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});