require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { URL } = require('url');

const { User, SearchResult } = require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan('combined'));

// Database connection
mongoose.connect(process.env.MONGODB_URI);

// Utility functions
const generateAPIKey = () => uuidv4();

// Web Crawler Function
async function crawlWeb(query) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set user agent to avoid bot detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  // Use Google search as entry point
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Extract top results
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.g')).map(result => ({
      title: result.querySelector('h3')?.innerText || '',
      url: result.querySelector('a')?.href || '',
      snippet: result.querySelector('.IsZvec')?.innerText || ''
    })).filter(result => result.url && result.url.startsWith('http'));
  });

  await browser.close();
  return results;
}

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const apiKey = req.headers['x-api-key'];
  
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
    } else if (apiKey) {
      req.user = await User.findOne({ apiKey });
    }
    
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes (register and login remain the same)

// Enhanced Search Endpoint
app.get('/search', authenticate, async (req, res) => {
  try {
    const { query, mode = 'hybrid' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let results = [];
    let webResults = [];

    // Always search indexed content first
    const indexedResults = await SearchResult.find({
      userId: req.user._id,
      $text: { $search: query }
    }).sort({ score: { $meta: 'textScore' } });

    // Format indexed results
    const formattedIndexed = indexedResults.map(r => ({
      source: 'index',
      url: r.url,
      title: r.title,
      content: r.content,
      metadata: r.metadata,
      ...(req.user.tier === 'advanced' && { 
        downloadUrl: r.metadata.type === 'document' ? `/download/${r._id}` : undefined 
      })
    }));

    // Get web results if needed
    if (mode === 'web' || mode === 'hybrid') {
      try {
        webResults = await crawlWeb(query);
        
        // For hybrid mode, combine and deduplicate results
        if (mode === 'hybrid') {
          const urlSet = new Set(formattedIndexed.map(r => r.url));
          webResults = webResults.filter(r => !urlSet.has(r.url));
        }
      } catch (webErr) {
        console.error('Web search failed:', webErr);
        if (mode === 'web') {
          throw new Error('Web search unavailable');
        }
      }
    }

    // Combine results based on mode
    if (mode === 'indexed') {
      results = formattedIndexed;
    } else if (mode === 'web') {
      results = webResults;
    } else {
      results = [...formattedIndexed, ...webResults];
    }

    // Format final output based on tier
    const response = {
      query,
      mode,
      count: results.length,
      results: results.map(r => ({
        url: r.url,
        title: r.title,
        ...(req.user.tier === 'basic' ? {
          snippet: r.content ? r.content.substring(0, 150) + '...' : r.snippet || ''
        } : {
          content: r.content || r.snippet || '',
          metadata: r.metadata || { source: 'web' },
          ...(r.downloadUrl ? { downloadUrl: r.downloadUrl } : {})
        })
      }))
    };

    res.json(response);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, searchConfig, tier } = req.body;
    
    // Validate search config
    if (!searchConfig.searchType) {
      return res.status(400).json({ error: 'Search type is required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateAPIKey();
    
    const user = new User({
      email,
      password: hashedPassword,
      apiKey,
      searchConfig,
      tier: tier || 'basic'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      apiKey,
      token,
      user: {
        id: user._id,
        email: user.email,
        tier: user.tier,
        searchConfig: user.searchConfig
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '30d'
    });
    
    res.json({
      message: 'Logged in successfully',
      apiKey: user.apiKey,
      token,
      user: {
        id: user._id,
        email: user.email,
        tier: user.tier,
        searchConfig: user.searchConfig
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});