const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  is_owner: { type: Boolean, default: false },
  created_at: { type: String, default: Date.now },
});

module.exports = mongoose.model('AdminSchema', adminSchema, 'admin');
