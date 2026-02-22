//els/Message.js
const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        room: { type: String, required: true }, // The Location ID or Committee ID
    },
    { timestamps: true }
)

// Index for faster queries when fetching history for a room
MessageSchema.index({ room: 1, createdAt: 1 })

module.exports = mongoose.model('Message', MessageSchema)
