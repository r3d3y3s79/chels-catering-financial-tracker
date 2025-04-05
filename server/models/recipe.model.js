const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
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
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  ingredients: [
    {
      ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'ingredient',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      notes: {
        type: String
      }
    }
  ],
  instructions: [
    {
      step: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    }
  ],
  preparationTime: {
    type: Number,
    min: 0,
    description: 'Preparation time in minutes'
  },
  cookingTime: {
    type: Number,
    min: 0,
    description: 'Cooking time in minutes'
  },
  totalCost: {
    type: Number,
    default: 0
  },
  costPerServing: {
    type: Number,
    default: 0
  },
  profitMargin: {
    type: Number,
    default: 0
  },
  suggestedPrice: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String
  },
  tags: [
    {
      type: String
    }
  ],
  notes: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false
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
RecipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('recipe', RecipeSchema);