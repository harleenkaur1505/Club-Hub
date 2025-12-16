// utils/generateToken.js
const jwt = require('jsonwebtoken')

exports.generateToken = (payload, secret = process.env.SESSION_SECRET, expiresIn = '7d') =>
  jwt.sign(payload, secret, { expiresIn })
