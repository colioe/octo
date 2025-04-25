const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  apiKey: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  
  // Search preferences
  searchConfig: {
    searchType: { type: String, enum: ['product', 'document', 'web'], required: true },
    
    // Product-specific
    productType: { type: String, enum: ['ecommerce', 'saas', 'local'] },
    productFields: [String],
    
    // Document-specific
    documentFormats: [String],
    ocrEnabled: Boolean,
    
    // Web-specific
    domains: {
      whitelist: [String],
      blacklist: [String],
      crawlDepth: { type: Number, default: 2 }
    }
  },
  
  // Subscription tier
  tier: { type: String, enum: ['basic', 'advanced'], default: 'basic' }
});

// models.js
const SearchResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true },
    title: { type: String },
    content: { type: String },
    metadata: { type: Object },
    indexedAt: { type: Date, default: Date.now }
  });
  
  // Create text index on title and content fields
  SearchResultSchema.index(
    { title: 'text', content: 'text' }, 
    { weights: { title: 10, content: 5 } } // Give title more importance
  );
  
  module.exports = {
    User: mongoose.model('User', UserSchema),
    SearchResult: mongoose.model('SearchResult', SearchResultSchema)
  };

module.exports = {
  User: mongoose.model('User', UserSchema),
  SearchResult: mongoose.model('SearchResult', SearchResultSchema)
};