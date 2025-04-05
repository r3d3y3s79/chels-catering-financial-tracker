const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff'],
    default: 'manager'
  },
  company: {
    type: String
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    defaultProfitMargin: {
      type: Number,
      default: 30
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);