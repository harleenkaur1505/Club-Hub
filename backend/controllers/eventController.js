// controllers/eventController.js
const Event = require('../models/Event')

// list
exports.listEvents = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.upcoming === 'true') {
      // Filter for future events (date >= now)
      filter.date = { $gte: new Date() }
    }
    const events = await Event.find(filter).sort({ date: 1 })
    res.json({ events })
  } catch (err) {
    next(err)
  }
}

exports.createEvent = async (req, res, next) => {
  try {
    const payload = req.body
    payload.createdBy = req.session.userId
    const event = await Event.create(payload)
    res.status(201).json({ event })
  } catch (err) {
    next(err)
  }
}

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees').populate('createdBy', 'name email')
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ event })
  } catch (err) {
    next(err)
  }
}

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ event })
  } catch (err) {
    next(err)
  }
}

exports.deleteEvent = async (req, res, next) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id)
    if (!ev) return res.status(404).json({ message: 'Event not found' })
    res.json({ message: 'Event removed' })
  } catch (err) {
    next(err)
  }
}
