const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feature: { type: String, enum: ['chatbot', 'damage_detection', 'service_advisor', 'recommendations', 'voice_booking', 'review_moderation'], required: true },
  prompt: { type: String, default: '' },
  response: { type: String, default: '' },
  tokensUsed: { type: Number, default: 0 },
  success: { type: Boolean, default: true },
}, { timestamps: true });

aiLogSchema.index({ feature: 1, createdAt: -1 });

const AiLog = mongoose.model('AiLog', aiLogSchema);
module.exports = AiLog;
