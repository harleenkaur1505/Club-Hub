// controllers/authController.js
const User = require('../models/User')

// register
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    // first registered user can be admin for dev convenience
    const role = (await User.countDocuments({})) === 0 ? 'admin' : 'member'
    const user = await User.create({ name, email, password, role })

    // Save user id in session
    req.session.userId = user._id
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    next(err)
  }
}

// login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const matched = await user.matchPassword(password)
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' })

    req.session.userId = user._1d || user._id
    req.session.userId = user._id
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    next(err)
  }
}

// logout
exports.logoutUser = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(err)
      res.clearCookie('club.sid')
      return res.json({ message: 'Logged out' })
    })
  } catch (err) {
    next(err)
  }
}

// get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) return res.status(200).json({ user: null })
    const user = await User.findById(req.session.userId).select('-password')
    if (!user) return res.status(200).json({ user: null })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}
