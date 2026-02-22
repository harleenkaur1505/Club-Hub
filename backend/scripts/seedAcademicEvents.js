//This script seeds and synchronizes Academic Club events by creating missing events 
//and updating existing ones, ensuring consistent and duplicate-free event data.
const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'Guest Lectures & Expert Talks',
        description: 'Join us for an inspiring session with industry leaders and academic pioneers. Gain insights into cutting-edge research and real-world applications of theoretical knowledge.',
        date: new Date('2025-02-20T14:00:00'), // Future event
        venue: 'Auditorium',
        images: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000'] // Lecture/Speaker image
    },
    {
        title: 'Research Paper Reading Sessions',
        description: 'Dive deep into the latest academic literature. We select a designated paper each session, break it down, and discuss its methodology, findings, and implications.',
        date: new Date('2025-03-15T16:00:00'), // Future event
        venue: 'Seminar Room 3',
        images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000'] // Books/Study image
    }
]

async function seedAcademicEvents() {
    try {
        console.log('🌱 Checking for Academic Club events...')

        const academicClub = await Committee.findOne({ name: 'Academic Club' })
        if (!academicClub) {
            console.log('⚠️  "Academic Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: academicClub._id
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
                    committee: academicClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Academic Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding Academic Club events:', err)
    }
}

module.exports = seedAcademicEvents;
