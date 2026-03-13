const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true }, // percentage
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;
