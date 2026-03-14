// ── REPLACE backend/routes/admin.js with this ─────────────────────────────
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Garage = require('../models/Garage');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');

// ── GET /api/admin/overview ────────────────────────────────────────────────
router.get('/overview', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const [users, garages, bookings] = await Promise.all([
      User.countDocuments(),
      Garage.countDocuments(),
      Booking.countDocuments(),
    ])
    res.json({ users, garages, bookings })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── GET /api/admin/users ───────────────────────────────────────────────────
router.get('/users', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query
    let query = {}
    if (role) query.role = role
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
    const skip = (page - 1) * limit
    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select('-password -refreshToken -otpCode')
      .populate('garage', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit))
    res.json({ users, total, pages: Math.ceil(total / limit) })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── POST /api/admin/workers — create worker account ───────────────────────
router.post('/workers', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, garageId, workerRole } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const worker = new User({
      name, email, phone,
      password: hashedPassword,
      role: 'worker',
      garage: garageId || null,
      workerRole: workerRole || 'washer',
    })
    await worker.save()

    if (garageId) {
      await Garage.findByIdAndUpdate(garageId, { $addToSet: { workers: worker._id } })
    }

    res.status(201).json({ message: 'Worker created', worker: { id: worker._id, name: worker.name, email: worker.email } })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── PUT /api/admin/users/:id/toggle ───────────────────────────────────────
router.put('/users/:id/toggle', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin' })
    user.isActive = !user.isActive
    await user.save()
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── DELETE /api/admin/users/:id ────────────────────────────────────────────
router.delete('/users/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── GET /api/admin/bookings — all bookings ─────────────────────────────────
router.get('/bookings', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    let query = {}
    if (status) query.status = status
    const skip = (page - 1) * limit
    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
      .populate('car_owner', 'name email')
      .populate('garage', 'name')
      .populate('worker', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit))
    res.json({ bookings, total, pages: Math.ceil(total / limit) })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

// ── Promo codes ────────────────────────────────────────────────────────────
router.get('/promos', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const PromoCode = require('../models/PromoCode')
    const promos = await PromoCode.find().sort({ createdAt: -1 })
    res.json(promos)
  } catch (error) { res.status(500).json({ message: error.message }) }
})

router.post('/promos', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const PromoCode = require('../models/PromoCode')
    const { code, discount, maxUses, expiresAt } = req.body
    const promo = new PromoCode({ code: code.toUpperCase(), discount, maxUses, expiresAt, createdBy: req.user._id })
    await promo.save()
    res.status(201).json(promo)
  } catch (error) { res.status(400).json({ message: error.message }) }
})

router.delete('/promos/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const PromoCode = require('../models/PromoCode')
    await PromoCode.findByIdAndDelete(req.params.id)
    res.json({ message: 'Promo deleted' })
  } catch (error) { res.status(500).json({ message: error.message }) }
})

module.exports = router
