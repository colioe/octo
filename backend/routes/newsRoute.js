const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const apiLimiter = require('../config/rateLimiter');

router.get('/', newsController.getNews);

module.exports = router;