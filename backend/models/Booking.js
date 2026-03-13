const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  car_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garage: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Service details
  service: {
    name: String,
    price: Number,
    duration: Number,
  },

  // Vehicle booked for
  vehicle: {
    make: String,
    model: String,
    year: Number,
    plate: String,
    color: String,
  },

  // Scheduling
  scheduledAt: { type: Date, required: true },
  estimatedEndAt: { type: Date },

  // Status flow: pending → confirmed → in_progress → completed | cancelled
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Notes
  customerNotes: { type: String, default: '' },
  workerNotes: { type: String, default: '' },

  // Photos proof
  beforePhotos: [String],
  afterPhotos: [String],

  // AI damage report
  damageReport: { type: String, default: '' },

  // Payment
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['card', 'wallet', 'cash'], default: 'card' },
  paymentIntentId: { type: String, default: '' },
  amountPaid: { type: Number, default: 0 },

  // Promo code used
  promoCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },

  // Loyalty stamp awarded
  stampAwarded: { type: Boolean, default: false },

  // Worker GPS (when in_progress)
  workerLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },

  // Rating after completion
  isRated: { type: Boolean, default: false },

  // Chat messages
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],

}, { timestamps: true });

bookingSchema.index({ car_owner: 1, status: 1 });
bookingSchema.index({ garage: 1, scheduledAt: -1 });
bookingSchema.index({ worker: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
