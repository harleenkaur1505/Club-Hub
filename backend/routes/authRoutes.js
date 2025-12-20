// routes/authRoutes.js
const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', getCurrentUser)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)


module.exports = router
