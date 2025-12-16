// middlewares/authMiddleware.js
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const user = await User.findById(req.session.userId).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' })
  }
}
