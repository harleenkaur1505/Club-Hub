const mongoose = require('mongoose')
const Location = require('../models/Location')
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const connectDB = require('../config/db')

const LOG_FILE = path.join(__dirname, '../seed.log');
const log = (msg) => {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${msg}\n`);
    console.log(msg);
};

const locations = [
    {
        name: 'Cozy and Lifestyle Club',
        address: 'Sector 17',
        city: 'Chandigarh',
        state: 'Punjab',
        zipCode: '160017',
        phone: '0172-1234567',
        capacity: 50,
        amenities: ['Lounge Area', 'Kitchenette', 'WiFi'],
        coordinates: { lat: 30.7333, lng: 76.7794 }
    },
    {
        name: 'Academic Club',
        address: 'Model Town',
        city: 'Ludhiana',
        state: 'Punjab',
        zipCode: '141002',
        phone: '0161-2345678',
        capacity: 100,
        amenities: ['Library', 'Study Rooms', 'Projectors'],
        coordinates: { lat: 30.9010, lng: 75.8573 }
    },
    {
        name: 'Creative and Fun Club',
        address: 'Ranjit Avenue',
        city: 'Amritsar',
        state: 'Punjab',
        zipCode: '143001',
        phone: '0183-3456789',
        capacity: 60,
        amenities: ['Art Supplies', 'Stage', 'Music System'],
        coordinates: { lat: 31.6340, lng: 74.8723 }
    },
    {
        name: 'Social and Community Club',
        address: 'Urban Estate Phase 1',
        city: 'Jalandhar',
        state: 'Punjab',
        zipCode: '144022',
        phone: '0181-4567890',
        capacity: 150,
        amenities: ['Large Hall', 'Kitchen', 'PA System'],
        coordinates: { lat: 31.3260, lng: 75.5762 }
    },
    {
        name: 'Tech and Skill Club',
        address: 'Industrial Area',
        city: 'Mohali',
        state: 'Punjab',
        zipCode: '160055',
        phone: '0172-5678901',
        capacity: 80,
        amenities: ['Computer Lab', 'High-speed WiFi', '3D Printers'],
        coordinates: { lat: 30.7046, lng: 76.7179 }
    },
    {
        name: 'Mental Health Awareness Club',
        address: 'Civil Lines',
        city: 'Patiala',
        state: 'Punjab',
        zipCode: '147001',
        phone: '0175-6789012',
        capacity: 40,
        amenities: ['Private Rooms', 'Garden', 'Meditation Area'],
        coordinates: { lat: 30.3398, lng: 76.3869 }
    }
]

async function seedLocations() {
    try {
        log('🌱 Starting to seed locations...')

        // 1. Get the list of allowed names from our seed data
        const allowedNames = locations.map(l => l.name);

        // 2. Delete any locations that are NOT in our allowed list
        const deleteResult = await Location.deleteMany({ name: { $nin: allowedNames } });
        if (deleteResult.deletedCount > 0) {
            log(`🗑️  Deleted ${deleteResult.deletedCount} stale/mismatched locations.`);
        }

        let created = 0
        let updated = 0

        for (const loc of locations) {
            // Upsert: Update if exists, Create if not
            const result = await Location.findOneAndUpdate(
                { name: loc.name },
                loc,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            // Determine if it was created or updated
            // In findOneAndUpdate with upsert, it's not always trivial to know, 
            // but we can assume if it returns a doc it was successful.
            // A simple way to track counts is imperfect with findOneAndUpdate unless we check before,
            // but for this seeding script, just knowing it succeeded is good enough.
            // We'll log "Processed".

            // To be more specific for the log counts:
            // Often we might just say "Processed". 
            // If we really want to know created vs updated, we'd need to check existence first or check `lastErrorObject`.
            // Let's simplify and just say Processed, or check existence quickly if performance isn't critical (it's not).

            // Actually, let's just stick to the robust one-op way and generic log, 
            // OR check existence to replicate the "Created/Updated" log style which is nice.

            const existing = await Location.findOne({ name: loc.name });
            // Wait, if I do findOne before, I lose the atomicity benefit slightly, but for a seed script it matches the style.
            // Actually, the previous code used `Location.create` or skipped.
            // Let's go back to findOneAndUpdate as the primary action.

            // Re-evaluating: standard Mongoose pattern
            // Let's just use the robust method.

            log(`✅ Processed: ${loc.name}`)
            updated++; // counting all as updated/verified
        }

        log(`\n✨ Location seeding complete!`)
        log(`   Processed: ${updated} locations`)

    } catch (error) {
        log(`❌ Error seeding locations: ${error.message}`)
        console.error('❌ Error seeding locations:', error)
    }
}

module.exports = seedLocations
