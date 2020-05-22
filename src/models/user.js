const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  lang: { type: String, default: 'en' },
  created_at: { type: String, default: Date.now },
});

module.exports = mongoose.model('UserSchema', userSchema, 'userData');
