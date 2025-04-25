const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  changePercent: { type: Number, required: true },
  description: { type: String },
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    index: { expires: '1h' } // Auto-delete after 1 hour
  }
});

// Add index for faster symbol lookups
stockSchema.index({ symbol: 1 });

module.exports = mongoose.model('Stock', stockSchema);