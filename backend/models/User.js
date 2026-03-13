const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['car_owner', 'worker', 'admin'], default: 'car_owner' },
  avatar: { type: String, default: '' },

  // Phone OTP verification
  isPhoneVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: '' },
  otpExpiry: { type: Date },

  // Account security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  isActive: { type: Boolean, default: true },

  // Car owner fields
  vehicles: [{
    make: String,
    model: String,
    year: Number,
    plate: String,
    color: String,
  }],

  // Worker fields
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
  workerRole: { type: String, enum: ['washer', 'mechanic', 'both', ''], default: '' },

  // Loyalty stamps per garage
  loyaltyStamps: [{
    garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
    stamps: { type: Number, default: 0 },
  }],

  // Push notifications
  pushToken: { type: String, default: '' },
  notificationPrefs: {
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
  },

  // Wallet
  walletBalance: { type: Number, default: 0 },

  // Refresh token
  refreshToken: { type: String, default: '' },

}, { timestamps: true });

// Index for fast queries
userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
