const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: true
    },
    si: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: function() {
      return this.date;
    }
  },
  type: {
    type: String,
    enum: ['holiday', 'poya', 'flowerOffering', 'special'],
    required: true
  },
  description: {
    en: String,
    si: String
  },
  isRecurringYearly: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#4299e1' // Default blue color
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);