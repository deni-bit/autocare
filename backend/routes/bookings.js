const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Garage = require('../models/Garage');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// ── HELPER: send socket notification ──────────────────────────────────────
const notify = async (req, userId, title, body, type, data) => {
  const notification = new Notification({ user: userId, title, body, type, data });
  await notification.save();
  const io = req.app.get('io');
  if (io) io.to(userId.toString()).emit('notification', { title, body, type, data });
};

// ── GET /api/bookings — get my bookings ───────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'car_owner') query.car_owner = req.user._id;
    else if (req.user.role === 'worker') query.worker = req.user._id;
    else if (req.user.role === 'admin') {} // admin sees all

    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car_owner', 'name avatar phone')
      .populate('garage', 'name location.address coverPhoto')
      .populate('worker', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ bookings, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/bookings/:id ─────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car_owner', 'name avatar phone')
      .populate('garage', 'name location phone coverPhoto')
      .populate('worker', 'name avatar phone')
      .populate('messages.sender', 'name avatar');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only involved parties can view
    const isOwner = booking.car_owner._id.toString() === req.user._id.toString();
    const isWorker = booking.worker?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isWorker && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/bookings — create booking ───────────────────────────────────
router.post('/', authMiddleware, authorize('car_owner'), async (req, res) => {
  try {
    const { garageId, serviceId, vehicle, scheduledAt, paymentMethod, promoCode, customerNotes } = req.body;

    if (!garageId || !serviceId || !vehicle || !scheduledAt) {
      return res.status(400).json({ message: 'Garage, service, vehicle and time are required' });
    }

    const garage = await Garage.findById(garageId);
    if (!garage || !garage.isActive) {
      return res.status(404).json({ message: 'Garage not found or inactive' });
    }

    const service = garage.services.id(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check for double booking
    const slotStart = new Date(scheduledAt);
    const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

    const conflict = await Booking.findOne({
      garage: garageId,
      status: { $nin: ['cancelled'] },
      $or: [
        { scheduledAt: { $lt: slotEnd, $gte: slotStart } },
        { estimatedEndAt: { $gt: slotStart, $lte: slotEnd } },
      ]
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' });
    }

    // Handle promo code
    let discountAmount = 0;
    if (promoCode) {
      const PromoCode = require('../models/PromoCode');
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ['$usedCount', '$maxUses'] }
      });
      if (promo) {
        discountAmount = (service.price * promo.discount) / 100;
        promo.usedCount += 1;
        await promo.save();
      }
    }

    const booking = new Booking({
      car_owner: req.user._id,
      garage: garageId,
      service: { name: service.name, price: service.price, duration: service.duration },
      vehicle,
      scheduledAt: slotStart,
      estimatedEndAt: slotEnd,
      paymentMethod: paymentMethod || 'card',
      promoCode,
      discountAmount,
      customerNotes,
    });

    await booking.save();

    // Notify garage workers
    const workers = await User.find({ garage: garageId, role: 'worker' });
    for (const worker of workers) {
      await notify(req, worker._id, '🚗 New Booking', `New booking for ${service.name} at ${slotStart.toLocaleTimeString()}`, 'booking', { bookingId: booking._id });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/bookings/:id/status — update booking status ─────────────────
router.put('/:id/status', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    if (status === 'in_progress') booking.worker = req.user._id;

    // Award loyalty stamp on completion
    if (status === 'completed' && !booking.stampAwarded) {
      const owner = await User.findById(booking.car_owner);
      const stampIndex = owner.loyaltyStamps.findIndex(s => s.garage.toString() === booking.garage.toString());
      if (stampIndex > -1) {
        owner.loyaltyStamps[stampIndex].stamps += 1;
      } else {
        owner.loyaltyStamps.push({ garage: booking.garage, stamps: 1 });
      }
      booking.stampAwarded = true;
      await owner.save();
    }

    await booking.save();

    // Notify car owner
    const statusMessages = {
      confirmed: '✅ Your booking has been confirmed!',
      in_progress: '🔧 Your service has started!',
      completed: '🎉 Your service is complete!',
      cancelled: '❌ Your booking was cancelled.',
    };

    await notify(req, booking.car_owner, 'Booking Update', statusMessages[status], 'booking', { bookingId: booking._id, status });

    // Emit to booking room
    const io = req.app.get('io');
    if (io) io.to(`booking_${booking._id}`).emit('status_update', { status });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/bookings/:id/cancel — car owner cancels ────────────────────
router.post('/:id/cancel', authMiddleware, authorize('car_owner'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.car_owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (['completed', 'in_progress'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel a booking that is in progress or completed' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/bookings/:id/photos — upload before/after photos ───────────
router.post('/:id/photos', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const { type, urls } = req.body; // type: 'before' | 'after'
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (type === 'before') booking.beforePhotos.push(...urls);
    else if (type === 'after') booking.afterPhotos.push(...urls);
    else return res.status(400).json({ message: 'Type must be before or after' });

    await booking.save();

    // Notify car owner of after photos
    if (type === 'after') {
      await notify(req, booking.car_owner, '📸 Photos Ready', 'Before & after photos of your vehicle are ready!', 'booking', { bookingId: booking._id });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/bookings/:id/message — in-booking chat ─────────────────────
router.post('/:id/message', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text is required' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const message = { sender: req.user._id, text, createdAt: new Date() };
    booking.messages.push(message);
    await booking.save();

    // Emit to booking room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${booking._id}`).emit('new_message', {
        ...message,
        sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/bookings/:id/worker-location — live GPS ─────────────────────
router.put('/:id/worker-location', authMiddleware, authorize('worker'), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { workerLocation: { type: 'Point', coordinates: [lng, lat] } },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const io = req.app.get('io');
    if (io) io.to(`booking_${booking._id}`).emit('worker_location_update', { lat, lng });

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
