const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  location: {
    lng: { type: String, required: true },
    lat: { type: String, required: true },
  },
  created_at: { type: String, default: Date.now },
});

module.exports = mongoose.model('LocationSchema', locationSchema, 'locationHistory');
