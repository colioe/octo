const Stock = require('../models/Stock');
const stockService = require('../services/stockService');

const getStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ symbol });

    if (!stock) {
      return res.status(404).json({ 
        success: false,
        message: 'Stock not found' 
      });
    }

    res.json({ 
      success: true,
      data: stock 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getPopularStocks = async (req, res) => {
  try {
    const popularSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'MA',
      'UNH', 'HD', 'PG', 'XOM', 'LLY', 'JNJ', 'BAC', 'AVGO', 'WMT', 'KO'
    ];
    
    const stocks = await stockService.getMultipleStocks(popularSymbols);
    
    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getWatchlistStocks = async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({
        success: false,
        message: 'Symbols parameter is required'
      });
    }
    
    const symbolList = symbols.split(',');
    const stocks = await stockService.getMultipleStocks(symbolList);
    
    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStock,
  getPopularStocks,
  getWatchlistStocks
};