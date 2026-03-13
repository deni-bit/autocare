const express = require('express');
const router = express.Router();
const Garage = require('../models/Garage');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// ── GET /api/garages — get all garages with filters + geospatial ───────────
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 10000, service, rating, open, featured, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    // Geospatial search — find garages near user
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius), // meters
        }
      };
    }

    // Filter by service type
    if (service) {
      query['services.name'] = { $regex: service, $options: 'i' };
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Featured first
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (page - 1) * limit;
    const total = await Garage.countDocuments(query);
    const garages = await Garage.find(query)
      .select('-workers -__v')
      .sort({ isFeatured: -1, rating: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ garages, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/garages/:id — get single garage ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id)
      .populate('workers', 'name avatar workerRole');
    if (!garage) return res.status(404).json({ message: 'Garage not found' });
    res.json(garage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/garages — admin creates garage ───────────────────────────────
router.post('/', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const {
      name, description, phone, email, website,
      coordinates, address, city,
      services, openingHours
    } = req.body;

    if (!name || !coordinates) {
      return res.status(400).json({ message: 'Name and coordinates are required' });
    }

    const garage = new Garage({
      name, description, phone, email, website,
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat], // GeoJSON: [lng, lat]
        address,
        city,
      },
      services: services || [],
      openingHours: openingHours || [],
      owner: req.user._id,
    });

    await garage.save();
    res.status(201).json(garage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── PUT /api/garages/:id — worker/admin updates garage ─────────────────────
router.put('/:id', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    // Workers can only update their own garage
    if (req.user.role === 'worker' &&
        req.user.garage?.toString() !== garage._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this garage' });
    }

    const updates = req.body;

    // Handle coordinates update separately
    if (updates.coordinates) {
      updates.location = {
        ...garage.location.toObject(),
        coordinates: [updates.coordinates.lng, updates.coordinates.lat],
      };
      delete updates.coordinates;
    }

    const updated = await Garage.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/garages/:id/services — add service ───────────────────────────
router.post('/:id/services', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    const { name, description, price, duration, photo } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ message: 'Name, price and duration are required' });
    }

    garage.services.push({ name, description, price, duration, photo });
    await garage.save();
    res.status(201).json(garage.services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/garages/:id/services/:serviceId — update service ──────────────
router.put('/:id/services/:serviceId', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    const service = garage.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    Object.assign(service, req.body);
    await garage.save();
    res.json(garage.services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/garages/:id/services/:serviceId ────────────────────────────
router.delete('/:id/services/:serviceId', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    garage.services = garage.services.filter(s => s._id.toString() !== req.params.serviceId);
    await garage.save();
    res.json(garage.services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/garages/:id/hours — update opening hours ─────────────────────
router.put('/:id/hours', authMiddleware, authorize('worker', 'admin'), async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    garage.openingHours = req.body.openingHours;
    await garage.save();
    res.json(garage.openingHours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/garages/:id/slots — get available booking slots ───────────────
router.get('/:id/slots', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const garage = await Garage.findById(req.params.id);
    if (!garage) return res.status(404).json({ message: 'Garage not found' });

    const Booking = require('../models/Booking');

    // Get existing bookings for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      garage: req.params.id,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    }).select('scheduledAt estimatedEndAt');

    // Get day of week opening hours
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const hours = garage.openingHours.find(h => h.day === dayName);

    if (!hours || hours.isClosed) {
      return res.json({ slots: [], message: 'Garage is closed on this day' });
    }

    // Generate 1-hour slots between open and close
    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const slots = [];

    for (let h = openH; h < closeH; h++) {
      const slotTime = new Date(date);
      slotTime.setHours(h, 0, 0, 0);

      // Check if slot is taken
      const isTaken = existingBookings.some(b => {
        const bStart = new Date(b.scheduledAt);
        const bEnd = new Date(b.estimatedEndAt || new Date(b.scheduledAt.getTime() + 60 * 60000));
        return slotTime >= bStart && slotTime < bEnd;
      });

      slots.push({
        time: `${String(h).padStart(2, '0')}:00`,
        datetime: slotTime,
        available: !isTaken,
      });
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/garages/:id — admin only ───────────────────────────────────
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    await Garage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Garage deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
