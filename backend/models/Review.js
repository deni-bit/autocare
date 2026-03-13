const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  car_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  // AI moderation
  aiFlag: { type: Boolean, default: false },
  aiFlagReason: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ garage: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
