const mongoose = require('mongoose')
const Committee = require('../models/Committee')
const Event = require('../models/Event')

const events = [
    {
        title: 'Cultural Exchange Day',
        description: 'Celebrate our diverse community! Bring a dish, wear traditional attire, or share a story from your culture. A day of food, music, and learning about each other’s heritage.',
        date: new Date('2025-04-12T11:00:00'), // Future event
        venue: 'Community Center Hall',
        images: ['https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1000'] // Cultural/Diversity image
    },
    {
        title: 'Open Discussion Circles',
        description: 'A safe space for meaningful conversations. We gather in circles to discuss relevant social topics, share perspectives, and practice active listening. All voices are welcome.',
        date: new Date('2025-01-25T17:00:00'), // Future event
        venue: 'Social Lounge',
        images: ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000'] // Discussion/Group image
    }
]

async function seedSocialEvents() {
    try {
        console.log('🌱 Checking for Social Club events...')

        const socialClub = await Committee.findOne({ name: 'Social and Community Club' })
        if (!socialClub) {
            console.log('⚠️  "Social and Community Club" not found! Skipping event seeding for it.')
            return
        }

        let created = 0;
        let updated = 0;
        for (const eventData of events) {
            // Check if event already exists
            const existing = await Event.findOne({
                title: eventData.title,
                committee: socialClub._id
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
                    committee: socialClub._id
                })
                console.log(`✅ Created Event: ${eventData.title}`)
                created++
            }
        }

        if (created > 0 || updated > 0) {
            console.log(`✨ Social Club Events: ${created} created, ${updated} updated`)
        }

    } catch (err) {
        console.error('❌ Error seeding Social Club events:', err)
    }
}

module.exports = seedSocialEvents;
