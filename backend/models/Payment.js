// models/Payment.js
const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema(
    {
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['dues', 'event', 'donation', 'other'], default: 'dues' },
        method: { type: String, enum: ['cash', 'card', 'bank_transfer', 'check'], default: 'cash' },
        notes: { type: String }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Payment', PaymentSchema)
