// controllers/locationController.js
const Location = require('../models/Location')

exports.listLocations = async (req, res, next) => {
    try {
        const locations = await Location.find().sort({ name: 1 })
        res.json({ locations }) // Wrapped in object to match frontend expectation
    } catch (err) {
        next(err)
    }
}

exports.createLocation = async (req, res, next) => {
    try {
        const location = await Location.create(req.body)
        res.status(201).json(location)
    } catch (err) {
        next(err)
    }
}

exports.getLocation = async (req, res, next) => {
    try {
        const location = await Location.findById(req.params.id)
        if (!location) return res.status(404).json({ message: 'Location not found' })
        res.json(location)
    } catch (err) {
        next(err)
    }
}

exports.updateLocation = async (req, res, next) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!location) return res.status(404).json({ message: 'Location not found' })
        res.json(location)
    } catch (err) {
        next(err)
    }
}

exports.deleteLocation = async (req, res, next) => {
    try {
        // Check if it's being used by members? For now just simple delete
        const location = await Location.findByIdAndDelete(req.params.id)
        if (!location) return res.status(404).json({ message: 'Location not found' })
        res.json({ message: 'Location removed' })
    } catch (err) {
        next(err)
    }
}
