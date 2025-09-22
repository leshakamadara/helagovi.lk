const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['farmer', 'buyer', 'admin'],
    unique: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  description: String
}, {
  timestamps: true
});

module.exports = {
  Role: mongoose.model('Role', roleSchema),
  Permission: mongoose.model('Permission', permissionSchema)
};