// models/Member.js
const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, index: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    feesDue: { type: Number, default: 0 },
    committees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Committee' }],
    joinedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Member', MemberSchema)
