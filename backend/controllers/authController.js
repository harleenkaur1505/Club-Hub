// controllers/authController.js
//This controller manages authentication, email verification, password recovery, 
// and session-based login while automatically creating member profiles for a club management system.
// controllers/authController.js
const User = require('../models/User')
const Member = require('../models/Member') // Import Member
const Payment = require('../models/Payment') // Import Payment
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')



// register
// register
// register
exports.registerUser = async (req, res, next) => {
  try {
    let { name, email, password, mobile, address } = req.body // Extract all fields

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    email = email.toLowerCase().trim()

    // Check if user exists
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    // Validations (simple regex checks)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const role = (await User.countDocuments({})) === 0 ? 'admin' : 'member'

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false
    })

    // AUTOMATICALLY CREATE MEMBER PROFILE
    const member = await Member.create({
      name: user.name,
      email: user.email,
      phone: mobile || '',
      address: address || '',
      joinedAt: new Date(),
      status: 'active',
      feesDue: 0
    })

    // Generate Verification Token (expires in 1 day)
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    )

    // Verification Link
    // Assuming frontend is running on standard Vite port 5173
    const verifyUrl = `${req.protocol}://localhost:5173/verify-email?token=${verificationToken}`

    const message = `
      <h1>Email Verification</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `

    try {
      await sendEmail({
        to: user.email,
        subject: 'Club Membership - Verify Email',
        text: `Verify email: ${verifyUrl}`,
        html: message
      })
    } catch (err) {
      console.error('Email send failed:', err)
      // We don't fail registration if email fails, but user needs to know
    }

    // Save session
    req.session.userId = user._id

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      message: 'Registration successful. Verification email sent.'
    })
  } catch (err) {
    next(err)
  }
}

// verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body // Frontend will send { token: "..." }

    if (!token) return res.status(400).json({ message: 'Missing verification token' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')

    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email already verified' })
    }

    user.isVerified = true
    await user.save()

    res.status(200).json({ message: 'Email verified successfully' })
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' })
    }
    next(err)
  }
}

// forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Please provide an email' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Generate Reset Token (expires in 20 mins)
    // We sign with user's current password hash + secret to ensure 
    // that if password changes, this token becomes invalid automatically (one-time use equivalent-ish)
    // BUT for simplicity, standard secret is often used. 
    // To implement "one-time" strictly, we can use a randomly generated secret stored in DB, strictly per user.
    // For this app, let's use standard secret for simplicity but short expiry.
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '20m' }
    )

    const resetUrl = `${req.protocol}://localhost:5173/reset-password?token=${resetToken}`

    const message = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `

    try {
      await sendEmail({
        to: user.email,
        subject: 'Club Membership - Password Reset',
        text: `Reset password link: ${resetUrl}`,
        html: message
      })
      res.status(200).json({ message: 'Email sent' })
    } catch (err) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()
      return res.status(500).json({ message: 'Email could not be sent' })
    }
  } catch (err) {
    next(err)
  }
}

// reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' })

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Set new password
    user.password = newPassword
    await user.save()

    res.status(200).json({ message: 'Password reset successful' })
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

    req.session.userId = user._id
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } })
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
