// controllers/announcementController.js
const Announcement = require('../models/Announcement')

exports.listAnnouncements = async (req, res, next) => {
    try {
        const { isActive } = req.query
        const filter = {}
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true'
        } else {
            // Default only show active? Or all? Frontend requests { isActive: true }
            // Let's support the filter.
        }

        // Frontend expects { announcements: [] }
        const announcements = await Announcement.find(filter).populate('author', 'name').sort({ date: -1 })
        res.json({ announcements })
    } catch (err) {
        next(err)
    }
}

exports.createAnnouncement = async (req, res, next) => {
    try {
        // Frontend sends 'message', model has 'message' now.
        const payload = {
            ...req.body,
            author: req.user ? req.user.userId : null
        }
        const announcement = await Announcement.create(payload)
        res.status(201).json(announcement)
    } catch (err) {
        next(err)
    }
}

exports.updateAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' })
        res.json(announcement)
    } catch (err) {
        next(err)
    }
}
