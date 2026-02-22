// controllers/locationController.js
//This controller manages CRUD operations for club locations and provides a 
//seeding function to automatically populate default venues for the application.
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

exports.seedLocations = async (req, res, next) => {
    try {
        const locations = [
            {
                name: 'Cozy and Lifestyle Hub',
                address: 'Sector 17',
                city: 'Chandigarh',
                state: 'Punjab',
                zipCode: '160017',
                phone: '0172-1234567',
                capacity: 50,
                amenities: ['Lounge Area', 'Kitchenette', 'WiFi']
            },
            {
                name: 'Academic Excellence Center',
                address: 'Model Town',
                city: 'Ludhiana',
                state: 'Punjab',
                zipCode: '141002',
                phone: '0161-2345678',
                capacity: 100,
                amenities: ['Library', 'Study Rooms', 'Projectors']
            },
            {
                name: 'Creative Arts Studio',
                address: 'Ranjit Avenue',
                city: 'Amritsar',
                state: 'Punjab',
                zipCode: '143001',
                phone: '0183-3456789',
                capacity: 60,
                amenities: ['Art Supplies', 'Stage', 'Music System']
            },
            {
                name: 'Community Gathering Hall',
                address: 'Urban Estate Phase 1',
                city: 'Jalandhar',
                state: 'Punjab',
                zipCode: '144022',
                phone: '0181-4567890',
                capacity: 150,
                amenities: ['Large Hall', 'Kitchen', 'PA System']
            },
            {
                name: 'Tech Innovation Lab',
                address: 'Industrial Area',
                city: 'Mohali',
                state: 'Punjab',
                zipCode: '160055',
                phone: '0172-5678901',
                capacity: 80,
                amenities: ['Computer Lab', 'High-speed WiFi', '3D Printers']
            },
            {
                name: 'Wellness & Support Center',
                address: 'Civil Lines',
                city: 'Patiala',
                state: 'Punjab',
                zipCode: '147001',
                phone: '0175-6789012',
                capacity: 40,
                amenities: ['Private Rooms', 'Garden', 'Meditation Area']
            }
        ]

        let created = 0
        for (const loc of locations) {
            const existing = await Location.findOne({ name: loc.name })
            if (!existing) {
                await Location.create(loc)
                created++
            }
        }
        res.json({ message: `Seeded ${created} locations` })
    } catch (err) {
        next(err)
    }
}
