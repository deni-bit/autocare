const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'review', 'promo', 'system'], default: 'system' },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
