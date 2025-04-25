const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  urlToImage: { type: String },
  description: { type: String },
  publishedAt: { type: Date, default: Date.now },
  content: { type: String },
  category: { type: String },
  isAd: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 1 day
});

module.exports = mongoose.model('News', newsSchema);