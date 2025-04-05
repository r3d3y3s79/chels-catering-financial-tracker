const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupermarketProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  supermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket',
    required: true
  },
  category: {
    type: String,
    enum: ['dairy', 'meat', 'produce', 'grains', 'spices', 'beverages', 'other', 'bakery', 'canned', 'frozen', 'snacks', 'condiments', 'breakfast', 'pasta', 'cleaning', 'personal'],
    default: 'other'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'AUD'
  },
  unit: {
    type: String,
    required: true
  },
  packageSize: {
    type: String,
    required: true
  },
  brand: {
    type: String
  },
  productCode: {
    type: String
  },
  barcode: {
    type: String
  },
  imageUrl: {
    type: String
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    min: 0
  },
  saleEndDate: {
    type: Date
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  nutritionalInfo: {
    calories: Number,
    fat: Number,
    carbs: Number,
    protein: Number,
    servingSize: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// When price changes, update priceHistory
SupermarketProductSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.priceHistory.push({
      price: this.price,
      date: new Date()
    });
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('supermarketProduct', SupermarketProductSchema);
