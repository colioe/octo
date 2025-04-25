const stockService = require('../services/stockService');
const Stock = require('../models/Stock');

const POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'MA',
    'UNH', 'HD', 'PG', 'XOM', 'LLY', 'JNJ', 'BAC', 'AVGO', 'WMT', 'KO',
    'PEP', 'ADBE', 'COST', 'MRK', 'ORCL', 'PFE', 'ABBV', 'CVX', 'DIS', 'CRM',
    'ACN', 'NKE', 'TMO', 'MCD', 'DHR', 'INTC', 'LIN', 'QCOM', 'TXN', 'NEE',
    'AMD', 'UPS', 'IBM', 'PM', 'LOW', 'CAT', 'SBUX', 'MS', 'GS', 'GE',
    'AMAT', 'BLK', 'AMGN', 'ISRG', 'VRTX', 'LMT', 'CI', 'NOW', 'PLD', 'ADI',
    'CB', 'MDT', 'DE', 'REGN', 'BA', 'SYK', 'ZTS', 'ADP', 'T', 'BKNG',
    'ELV', 'MO', 'AXP', 'TJX', 'SPGI', 'ETN', 'MMC', 'WM', 'APD', 'FISV',
    'SCHW', 'GILD', 'HUM', 'FDX', 'CSCO', 'ROST', 'GM', 'PSX', 'GD', 'MU',
    'CL', 'BIIB', 'EW', 'ITW', 'SO', 'DUK', 'C', 'TRV', 'EOG', 'ILMN',
    'BMY', 'PGR', 'HCA', 'AEP', 'NOC', 'AFL', 'BSX', 'EXC', 'SPG', 'ALL',
    'TGT', 'MAR', 'KMB', 'EMR', 'SLB', 'F', 'ECL', 'TEL', 'MCK', 'HPQ',
    'D', 'A', 'WBA', 'VLO', 'PCAR', 'KMI', 'PAYX', 'HAL', 'WELL', 'ORLY',
    'DOW', 'CNC', 'AZO', 'NEM', 'WMB', 'XEL', 'SRE', 'CTAS', 'STZ', 'DVN',
    'CTSH', 'PRU', 'LHX', 'CMG', 'CARR', 'OTIS', 'DFS', 'MTD', 'KR', 'TDG',
    'FANG', 'NUE', 'FTNT', 'PPG', 'O', 'MSI', 'APH', 'CHD', 'DG', 'DLR',
    'EBAY', 'PH', 'RSG', 'VRSK', 'HIG', 'KEYS', 'PWR', 'ROK', 'BKR', 'AVB',
    'ANET', 'HES', 'YUM', 'LDOS', 'TSCO', 'ETR', 'CAH', 'FAST', 'MLM', 'BBY',
    'AEE', 'CNP', 'BAX', 'CMS', 'CE', 'GLW', 'ZBRA', 'CF', 'VFC', 'BR',
    'AES', 'PEG', 'BALL', 'NRG', 'STE', 'TYL', 'TXT', 'INCY', 'WRB', 'AKAM',
    'RCL', 'UAL', 'LUV', 'DAL', 'AAL', 'CHRW', 'L', 'MTB', 'HBAN', 'USB',
    'PNC', 'FITB', 'CFG', 'RF', 'KEY', 'CMA', 'ALLY', 'ZION'
  ];
  

// Configuration
const MAX_REQUESTS_PER_MINUTE = 50; // Conservative limit below Finnhub's 60/min
const DELAY_BETWEEN_REQUESTS = 1200; // 1.2 seconds between requests
const BATCH_INTERVAL = 65 * 1000; // 65 second batches
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 5000; // 5 seconds between retries

let currentIndex = 0;
let isProcessing = false;

const processStock = async (symbol, attempt = 0) => {
  try {
    const result = await stockService.fetchStockData(symbol);
    console.log(`Updated ${symbol}: $${result.price.toFixed(2)} (${result.changePercent > 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`);
    return true;
  } catch (error) {
    if (attempt < RETRY_ATTEMPTS) {
      console.warn(`Retry ${attempt + 1} for ${symbol} in ${RETRY_DELAY / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return processStock(symbol, attempt + 1);
    }
    console.error(`Failed to update ${symbol} after ${RETRY_ATTEMPTS} attempts:`, error.message);
    return false;
  }
};

const refreshStockBatch = async () => {
  if (isProcessing) {
    console.log('Skipping batch - previous one still processing');
    return;
  }

  isProcessing = true;
  try {
    console.log(`\n=== Starting batch at ${new Date().toLocaleTimeString()} ===`);
    
    const batchSymbols = [];
    for (let i = 0; i < MAX_REQUESTS_PER_MINUTE; i++) {
      if (currentIndex >= POPULAR_STOCKS.length) currentIndex = 0;
      batchSymbols.push(POPULAR_STOCKS[currentIndex]);
      currentIndex++;
    }

    console.log(`Processing ${batchSymbols.length} stocks: ${batchSymbols.join(', ')}`);
    
    // Process stocks sequentially with delay
    let successCount = 0;
    for (const symbol of batchSymbols) {
      const success = await processStock(symbol);
      if (success) successCount++;
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }

    console.log(`Batch completed: ${successCount} successful, ${batchSymbols.length - successCount} failed`);
    
    if (currentIndex >= POPULAR_STOCKS.length) {
      currentIndex = 0;
      console.log('Completed full cycle of all stocks');
      console.log(`Next full cycle will complete in ~${Math.ceil(POPULAR_STOCKS.length / MAX_REQUESTS_PER_MINUTE)} minutes`);
    }
  } catch (error) {
    console.error('Unexpected error in batch processing:', error);
  } finally {
    isProcessing = false;
  }
};

const startStockWorker = () => {
  console.log('Starting intelligent stock data worker...');
  console.log(`Tracking ${POPULAR_STOCKS.length} stocks`);
  console.log(`Processing ${MAX_REQUESTS_PER_MINUTE} stocks every ${BATCH_INTERVAL / 1000} seconds`);
  console.log(`Full cycle time: ~${Math.ceil(POPULAR_STOCKS.length / MAX_REQUESTS_PER_MINUTE)} minutes`);

  // Initial batch
  refreshStockBatch();

  // Set up periodic batches
  setInterval(refreshStockBatch, BATCH_INTERVAL);
};

module.exports = startStockWorker;