const newsService = require('../services/newsService');
const TOTAL_REQUESTS = 100;
const HOURS_IN_DAY = 24;
const REQUESTS_PER_HOUR = Math.ceil(TOTAL_REQUESTS / HOURS_IN_DAY); // 5 requests/hour
const INTERVAL_MS = 60 * 60 * 1000 / REQUESTS_PER_HOUR; // 12 minutes between requests

let totalRequestsMade = 0;

const fetchNewsBatch = async () => {
  try {
    if (totalRequestsMade >= TOTAL_REQUESTS) {
      console.log('Daily news request quota completed');
      return;
    }

    console.log(`[${new Date().toISOString()}] Fetching news batch (Request ${totalRequestsMade + 1}/${TOTAL_REQUESTS})`);
    
    const result = await newsService.fetchAndStoreNews();
    
    if (result.success) {
      totalRequestsMade += result.requestsUsed || 1;
      console.log(`Stored ${result.storedCount} articles. Remaining: ${TOTAL_REQUESTS - totalRequestsMade}`);
    } else {
      console.log('News fetch failed:', result.message);
    }
  } catch (error) {
    console.error('Error in news worker:', error);
  }
};

const startNewsWorker = () => {
  console.log('Starting news worker...');
  console.log(`Configuration:
    - Total daily requests: ${TOTAL_REQUESTS}
    - Requests per hour: ${REQUESTS_PER_HOUR}
    - Interval between requests: ${INTERVAL_MS / 60000} minutes`);

  // Initial fetch
  fetchNewsBatch();

  // Set up periodic fetching
  const intervalId = setInterval(() => {
    if (totalRequestsMade >= TOTAL_REQUESTS) {
      clearInterval(intervalId);
      return;
    }
    fetchNewsBatch();
  }, INTERVAL_MS);

  // Reset counter at midnight
  setInterval(() => {
    totalRequestsMade = 0;
    console.log('Reset daily request counter at midnight');
  }, 24 * 60 * 60 * 1000 - (Date.now() % (24 * 60 * 60 * 1000)));
};

module.exports = startNewsWorker;