const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'Mindfulness & Meditation Sessions',
        description: 'Find your center and reduce anxiety with our guided mindfulness and meditation sessions. Learn techniques to improve focus, emotional regulation, and overall well-being.',
        date: new Date('2025-01-20T08:00:00'), // Future event
        venue: 'Quiet Room',
        images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'] // Yoga/Meditation image
    },
    {
        title: 'Stress Management Programs',
        description: 'Equip yourself with tools to handle life\'s pressures. Our interactive workshops cover stress identification, coping mechanisms, and building resilience.',
        date: new Date('2025-03-10T14:00:00'), // Future event
        venue: 'Community Hall B',
        images: ['https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=1000'] // Wellness/Relaxation image
    }
]

async function seedMentalHealthEvents() {
    try {
        console.log('🌱 Checking for Mental Health Club events...')

        const mhClub = await Committee.findOne({ name: 'Mental Health Awareness Club' })
        if (!mhClub) {
            console.log('⚠️  "Mental Health Awareness Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: mhClub._id
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
                    committee: mhClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Mental Health Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding Mental Health Club events:', err)
    }
}

module.exports = seedMentalHealthEvents;
