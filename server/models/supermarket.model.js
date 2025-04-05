const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupermarketSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logoUrl: {
    type: String
  },
  websiteUrl: {
    type: String
  },
  scrapingEnabled: {
    type: Boolean,
    default: false
  },
  scrapingUrls: {
    baseUrl: {
      type: String
    },
    searchEndpoint: {
      type: String
    }
  },
  lastScraped: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
SupermarketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('supermarket', SupermarketSchema);
