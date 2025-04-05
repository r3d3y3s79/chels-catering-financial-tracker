const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShoppingListItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'supermarketProduct'
  },
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
    default: 1,
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
  supermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket'
  },
  notes: {
    type: String
  },
  isChecked: {
    type: Boolean,
    default: false
  }
});

const ShoppingListSchema = new Schema({
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
  items: [ShoppingListItemSchema],
  totalCost: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  primarySupermarket: {
    type: Schema.Types.ObjectId,
    ref: 'supermarket'
  },
  plannedPurchaseDate: {
    type: Date
  },
  completedDate: {
    type: Date
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

// Update total cost and updatedAt when items change
ShoppingListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isModified('items')) {
    this.totalCost = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  next();
});

module.exports = mongoose.model('shoppingList', ShoppingListSchema);
