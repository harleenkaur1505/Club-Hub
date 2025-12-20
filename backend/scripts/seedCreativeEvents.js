const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'Paint & Chill',
        description: 'Unwind with a brush in one hand and a beverage in the other. No experience necessary! Our instructor will guide you step-by-step through creating your own masterpiece to take home.',
        date: new Date('2025-02-10T18:00:00'), // Future event
        venue: 'Art Studio B',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000'] // Art/Painting image
    },
    {
        title: 'Theme Art Day',
        description: 'A day dedicated to exploring specific art themes. Bring your creativity and supplies (or use ours) to create artwork based on the secret theme revealed at the start of the event.',
        date: new Date('2025-03-05T10:00:00'), // Future event
        venue: 'Main Hall',
        images: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000'] // Colorful art supplies
    }
]

async function seedCreativeEvents() {
    try {
        console.log('🌱 Checking for Creative Club events...')

        const creativeClub = await Committee.findOne({ name: 'Creative and Fun Club' })
        if (!creativeClub) {
            console.log('⚠️  "Creative and Fun Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: creativeClub._id
            })

            if (existing) {
                // Force update images/details if they changed
                if (JSON.stringify(existing.images) !== JSON.stringify(eventData.images) || existing.description !== eventData.description) {
                    existing.images = eventData.images;
                    existing.description = eventData.description;
                    existing.venue = eventData.venue;
                    existing.date = eventData.date;
                    await existing.save();
                    console.log(`   🔄 Updated event "${eventData.title}"`);
                    updated++;
                }
            } else {
                await Event.create({
                    ...eventData,
                    committee: creativeClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Creative Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding Creative Club events:', err)
    }
}

module.exports = seedCreativeEvents;
