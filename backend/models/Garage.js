const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Location — GeoJSON for $near queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String, default: '' },
    city: { type: String, default: '' },
  },

  description: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },

  // Photos
  photos: [String],
  coverPhoto: { type: String, default: '' },

  // Services offered
  services: [{
    name: String,
    description: String,
    price: Number,
    duration: Number, // minutes
    photo: String,
    isActive: { type: Boolean, default: true },
  }],

  // Opening hours
  openingHours: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    open: String,   // e.g. "08:00"
    close: String,  // e.g. "18:00"
    isClosed: { type: Boolean, default: false },
  }],

  // Ratings
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  // Workers assigned
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Promo
  activePromo: {
    title: String,
    discount: Number, // percentage
    expiresAt: Date,
  },

}, { timestamps: true });

// Geospatial index — required for $near queries
garageSchema.index({ location: '2dsphere' });
garageSchema.index({ isActive: 1, isFeatured: -1, rating: -1 });

const Garage = mongoose.model('Garage', garageSchema);
module.exports = Garage;
