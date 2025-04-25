const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const apiLimiter = require('../config/rateLimiter');

// Apply rate limiting to all stock routes
router.use(apiLimiter);

// Get specific stock data
router.get('/:symbol', stockController.getStock);

// Get popular stocks
router.get('/popular', stockController.getPopularStocks);

// Get stocks for watchlist (comma-separated symbols)
router.get('/', stockController.getWatchlistStocks);

module.exports = router;