const axios = require('axios');
const News = require('../models/News');

const fetchAndStoreNews = async () => {
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY
      },
      timeout: 5000
    });

    const articles = response.data.articles || [];
    let storedCount = 0;

    await Promise.all(articles.map(async (article) => {
      try {
        await News.updateOne(
          { url: article.url },
          {
            $setOnInsert: {
              title: article.title,
              source: article.source?.name || 'Unknown',
              url: article.url,
              urlToImage: article.urlToImage,
              description: article.description,
              publishedAt: new Date(article.publishedAt) || new Date(),
              content: article.content
            }
          },
          { upsert: true }
        );
        storedCount++;
      } catch (err) {
        if (err.code !== 11000) console.error('Error saving article:', err);
      }
    }));

    return {
      success: true,
      storedCount,
      requestsUsed: 1,
      remaining: process.env.DAILY_LIMIT - (await getTodayRequestCount()) - 1
    };

  } catch (error) {
    console.error('News API error:', error.message);
    return { success: false, message: error.message };
  }
};

const getTodayRequestCount = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return News.countDocuments({ createdAt: { $gte: today } });
};

const getStoredNews = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const news = await News.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await News.countDocuments();
    
    return {
      success: true,
      data: news,
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total
    };
  } catch (error) {
    console.error('Error in getStoredNews:', error);
    return { success: false, message: error.message };
  }
};
module.exports = {
  fetchAndStoreNews,
  getStoredNews
};