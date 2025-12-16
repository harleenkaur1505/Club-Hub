// models/Announcement.js
const mongoose = require('mongoose')

const AnnouncementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true }, // Changed content to message to match frontend
        date: { type: Date, default: Date.now },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        target: { type: String, enum: ['all', 'members', 'committee', 'specific'], default: 'all' },
        active: { type: Boolean, default: true }, // Frontend uses isActive, but usually mapped. Let's send 'isActive' in toJSON if needed or just use active
        // Actually frontend uses 'isActive', and sends 'isActive'. Let's use 'isActive' as field name if possible or map it.
        // Mongoose allows 'isActive'.
        isActive: { type: Boolean, default: true },
        type: { type: String, default: 'general' },
        priority: { type: String, default: 'normal' },
        targetMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
        targetCommittees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Committee' }],
        expiresAt: { type: Date }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Announcement', AnnouncementSchema)
