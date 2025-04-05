const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  supplier: {
    type: String
  },
  category: {
    type: String,
    enum: ['grocery', 'wholesale', 'specialty', 'farmers_market', 'other'],
    default: 'other'
  },
  items: [
    {
      ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'ingredient'
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      notes: {
        type: String
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'other'],
    default: 'other'
  },
  receiptImage: {
    type: String
  },
  notes: {
    type: String
  },
  tags: [
    {
      type: String
    }
  ],
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
PurchaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total amount if not provided
  if (!this.totalAmount && this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.price, 0);
  }
  
  next();
});

module.exports = mongoose.model('purchase', PurchaseSchema);