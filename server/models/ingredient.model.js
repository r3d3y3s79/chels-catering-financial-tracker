const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Price schema for tracking prices from different supermarkets
const PriceSchema = new Schema({
  supermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceDate: {
    type: Date,
    default: Date.now
  },
  isManualEntry: {
    type: Boolean,
    default: false
  },
  productUrl: {
    type: String
  }
});

// Price history to track changes over time
const PriceHistorySchema = new Schema({
  supermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  isManualEntry: {
    type: Boolean,
    default: false
  }
});

const IngredientSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['dairy', 'meat', 'produce', 'grains', 'spices', 'beverages', 'other', 'bakery', 'canned', 'frozen', 'snacks', 'condiments', 'breakfast', 'pasta', 'cleaning', 'personal'],
    default: 'other'
  },
  // Default purchase price (used for calculations if no specific supermarket is selected)
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'AUD',
    enum: ['AUD', 'USD', 'EUR', 'GBP', 'NZD', 'JPY']
  },
  // Specific prices from different supermarkets
  prices: [PriceSchema],
  // Historical price data for tracking changes
  priceHistory: [PriceHistorySchema],
  preferredSupermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket'
  },
  purchaseUnit: {
    type: String,
    required: true
  },
  recipeUnit: {
    type: String,
    required: true
  },
  conversionRatio: {
    type: Number,
    required: true,
    description: 'Number of recipe units per purchase unit'
  },
  supplier: {
    type: String
  },
  barcode: {
    type: String
  },
  imageUrl: {
    type: String
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  wastagePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String
  },
  isStandardItem: {
    type: Boolean,
    default: false,
    description: 'Indicates if this is a pre-loaded standard item'
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
IngredientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If a new price is added to the prices array, add it to the price history as well
  if (this.isModified('prices')) {
    const newPrices = this.prices.filter(price => {
      // Find if this supermarket price exists in the history with the same date
      const existsInHistory = this.priceHistory.some(history => 
        history.supermarket.equals(price.supermarket) && 
        history.date.toDateString() === price.priceDate.toDateString()
      );
      
      return !existsInHistory;
    });
    
    // Add new prices to history
    newPrices.forEach(price => {
      this.priceHistory.push({
        supermarket: price.supermarket,
        price: price.price,
        date: price.priceDate,
        isManualEntry: price.isManualEntry
      });
    });
  }
  
  next();
});

// Method to get the current best price
IngredientSchema.methods.getBestPrice = function() {
  if (!this.prices || this.prices.length === 0) {
    return this.purchasePrice;
  }
  
  // Find the lowest current price
  return Math.min(...this.prices.map(price => price.price));
};

// Method to get price from a specific supermarket
IngredientSchema.methods.getPriceFromSupermarket = function(supermarketId) {
  if (!this.prices || this.prices.length === 0) {
    return this.purchasePrice;
  }
  
  const supermarketPrice = this.prices.find(price => 
    price.supermarket.toString() === supermarketId.toString()
  );
  
  return supermarketPrice ? supermarketPrice.price : this.purchasePrice;
};

module.exports = mongoose.model('ingredient', IngredientSchema);
