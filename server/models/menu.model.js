const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
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
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'beverage', 'special', 'catering', 'other'],
    default: 'other'
  },
  items: [
    {
      recipe: {
        type: Schema.Types.ObjectId,
        ref: 'recipe'
      },
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      price: {
        type: Number,
        required: true
      },
      cost: {
        type: Number,
        default: 0
      },
      profitMargin: {
        type: Number,
        default: 0
      },
      isAvailable: {
        type: Boolean,
        default: true
      },
      imageUrl: {
        type: String
      },
      tags: [
        {
          type: String
        }
      ]
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  totalCost: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageProfitMargin: {
    type: Number,
    default: 0
  },
  tags: [
    {
      type: String
    }
  ],
  notes: {
    type: String
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
MenuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total cost and average profit margin
  if (this.items && this.items.length > 0) {
    let totalCost = 0;
    let totalRevenue = 0;
    
    this.items.forEach(item => {
      totalCost += item.cost || 0;
      totalRevenue += item.price || 0;
    });
    
    this.totalCost = totalCost;
    this.totalRevenue = totalRevenue;
    
    if (totalCost > 0 && totalRevenue > 0) {
      this.averageProfitMargin = ((totalRevenue - totalCost) / totalRevenue) * 100;
    }
  }
  
  next();
});

module.exports = mongoose.model('menu', MenuSchema);