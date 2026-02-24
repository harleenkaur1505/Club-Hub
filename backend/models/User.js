// models/User.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'committee', 'member'], default: 'member' },
    isVerified: { type: Boolean, default: false },
    resetPasswordOtp: { type: String },
    resetPasswordExpire: { type: Date }
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', UserSchema)
