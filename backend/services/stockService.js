const axios = require('axios');
const Stock = require('../models/Stock');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd05upmhr01qgqsu9nep0d05upmhr01qgqsu9nepg';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const fetchStockData = async (symbol) => {
    try {
      const [quote, profile] = await Promise.all([
        axios.get(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
        axios.get(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
      ]);
  
      if (quote.data.c === undefined || quote.data.d === undefined) {
        throw new Error('Invalid data received from Finnhub');
      }
  
      const updateData = {
        price: quote.data.c,
        change: quote.data.d,
        changePercent: quote.data.dp,
        description: profile.data.name || symbol,
        lastUpdated: new Date()
      };
  
      return Stock.findOneAndUpdate(
        { symbol },
        updateData,
        { upsert: true, new: true }
      );
  
    } catch (error) {
      if (error.response?.status === 429) {
        error.message = 'Rate limit exceeded - please slow down requests';
      }
      throw error;
    }
  };

const getMultipleStocks = async (symbols) => {
  try {
    // Get all requested stocks from DB
    const stocks = await Stock.find({ 
      symbol: { $in: symbols.map(s => s.toUpperCase()) } 
    });
    
    return stocks.map(stock => stock.toObject());
    
  } catch (error) {
    console.error('Error getting multiple stocks:', error);
    throw error;
  }
};

module.exports = {
  fetchStockData,
  getMultipleStocks
};