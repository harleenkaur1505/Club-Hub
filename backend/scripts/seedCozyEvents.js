const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'DIY Home Décor Workshop',
        description: 'Learn how to create beautiful home decor items from scratch. Join us for a hands-on session where we make wall hangings, photo frames, and more.',
        date: new Date('2025-01-15T14:00:00'), // Future event
        venue: 'Community Hall A',
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000']
    },
    {
        title: 'Candle & Aroma Making Workshop',
        description: 'Discover the art of making scented candles. Create your own custom fragrances and take home a set of handmade candles to cozy up your space.',
        date: new Date('2025-11-20T10:00:00'), // Past event
        venue: 'Workshop Studio',
        images: ['https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&q=80&w=1000']
    },
    {
        title: 'Indoor Plants & Aesthetic Corners',
        description: 'Transform your home with indoor plants. Learn about plant care, styling corners, and creating aesthetic green spaces in your living area.',
        date: new Date('2024-12-05T16:00:00'), // Past event
        venue: 'Greenhouse Garden',
        images: ['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=1000']
    }
]

async function seedCozyEvents() {
    try {
        console.log('🌱 Checking for Cozy Club events...')

        const cozyClub = await Committee.findOne({ name: 'Cozy and Lifestyle Club' })
        if (!cozyClub) {
            console.log('⚠️  "Cozy and Lifestyle Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: cozyClub._id
            })

            if (existing) {
                // Force update images to ensure they match the seed data
                if (JSON.stringify(existing.images) !== JSON.stringify(eventData.images)) {
                    existing.images = eventData.images;
                    await existing.save();
                    console.log(`   🔄 Updated image for "${eventData.title}"`);
                    updated++;
                }
            } else {
                await Event.create({
                    ...eventData,
                    committee: cozyClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Cozy Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding events:', err)
    }
}

module.exports = seedCozyEvents;
