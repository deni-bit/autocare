const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// ── HELPERS ────────────────────────────────────────────────────────────────
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (role === 'admin' || role === 'worker') {
      return res.status(400).json({ message: 'Cannot self-register as admin or worker' });
    }

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name, email, phone,
      password: hashedPassword,
      role: role || 'car_owner',
    });

    // Generate OTP if phone provided
    if (phone) {
      user.otpCode = generateOTP();
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      // TODO: Send OTP via Africa's Talking
      console.log(`📱 OTP for ${phone}: ${user.otpCode}`);
    }

    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isPhoneVerified: user.isPhoneVerified,
        walletBalance: user.walletBalance,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Check account lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    // Check active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Contact support.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 min
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isPhoneVerified: user.isPhoneVerified,
        walletBalance: user.walletBalance,
        garage: user.garage,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// ── POST /api/auth/verify-otp ──────────────────────────────────────────────
router.post('/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.otpCode) return res.status(400).json({ message: 'No OTP requested' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    if (user.otpCode !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.isPhoneVerified = true;
    user.otpCode = '';
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Phone verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/resend-otp ──────────────────────────────────────────────
router.post('/resend-otp', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.otpCode = generateOTP();
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    console.log(`📱 New OTP for ${user.phone}: ${user.otpCode}`);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken -otpCode')
      .populate('garage', 'name location rating');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/auth/profile ──────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatar, notificationPrefs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar, notificationPrefs },
      { new: true }
    ).select('-password -refreshToken -otpCode');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/vehicles ────────────────────────────────────────────────
router.post('/vehicles', authMiddleware, authorize('car_owner'), async (req, res) => {
  try {
    const { make, model, year, plate, color } = req.body;
    const user = await User.findById(req.user._id);
    user.vehicles.push({ make, model, year, plate, color });
    await user.save();
    res.status(201).json(user.vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/auth/vehicles/:vehicleId ──────────────────────────────────
router.delete('/vehicles/:vehicleId', authMiddleware, authorize('car_owner'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.vehicles = user.vehicles.filter(v => v._id.toString() !== req.params.vehicleId);
    await user.save();
    res.json(user.vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
