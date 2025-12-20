const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'Coding Bootcamps',
        description: 'Accelerate your programming journey with our intensive coding bootcamps. Whether you are a beginner or looking to sharpen your skills, dive into hands-on coding challenges and real-world projects.',
        date: new Date('2025-05-05T10:00:00'), // Future event
        venue: 'Computer Lab 1',
        images: ['https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000'] // Coding/Meeting image
    },
    {
        title: 'Data Structures & Algorithms Sessions',
        description: 'Master the fundamentals of computer science. We cover key data structures and algorithms to help you ace technical interviews and improve your problem-solving skills.',
        date: new Date('2025-02-15T15:00:00'), // Future event
        venue: 'Tech Seminar Hall',
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000'] // Code/Screen image
    }
]

async function seedTechEvents() {
    try {
        console.log('🌱 Checking for Tech Club events...')

        const techClub = await Committee.findOne({ name: 'Tech and Skill Club' })
        if (!techClub) {
            console.log('⚠️  "Tech and Skill Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: techClub._id
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
                    committee: techClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Tech Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding Tech Club events:', err)
    }
}

module.exports = seedTechEvents;
