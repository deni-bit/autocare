const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -refreshToken -otpCode');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account temporarily locked. Try again later.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
