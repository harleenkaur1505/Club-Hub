//This script resets the locations collection
// and seeds it with a predefined set of correct club locations, ensuring clean and consistent location data.
const mongoose = require('mongoose');
const Location = require('../models/Location');
require('dotenv').config({ path: '../.env' });
const connectDB = require('../config/db');

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
];

const run = async () => {
    try {
        await connectDB();
        console.log('🔌 Connected to DB');

        // Count before
        const beforeCount = await Location.countDocuments();
        console.log(`📊 Locations before reset: ${beforeCount}`);

        // DELETE ALL
        await Location.deleteMany({});
        console.log('🗑️  Deleted ALL locations.');

        // INSERT 6 CORRECT ONES
        await Location.insertMany(locations);
        console.log(`✅ Inserted ${locations.length} correct locations.`);

        // Count after
        const afterCount = await Location.countDocuments();
        console.log(`📊 Locations after reset: ${afterCount}`);

        // List names
        const allLocs = await Location.find({});
        console.log('📝 Current Locations:');
        allLocs.forEach(l => console.log(`   - ${l.name}`));

        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
}
run();
