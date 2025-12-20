// scripts/seedClubs.js
// Seed script to initialize the mini clubs in the database
const mongoose = require('mongoose')
const Committee = require('../models/Committee')
require('dotenv').config()

const connectDB = require('../config/db')

const clubs = [
  {
    name: 'Cozy and Lifestyle Club',
    description: 'A welcoming space for members interested in wellness, home decor, cooking, and creating a comfortable, balanced lifestyle. Join us for workshops on mindfulness, interior design, healthy living, and cozy gatherings.',
    location: 'Sector 17, Chandigarh, Punjab'
  },
  {
    name: 'Academic Club',
    description: 'Dedicated to intellectual growth, research, and academic excellence. Participate in study groups, research projects, academic competitions, and scholarly discussions across various disciplines.',
    location: 'Model Town, Ludhiana, Punjab'
  },
  {
    name: 'Creative and Fun Club',
    description: 'Unleash your creativity! Join us for art workshops, creative writing, music sessions, drama, and fun activities. Perfect for anyone who loves expressing themselves through various creative mediums.',
    location: 'Ranjit Avenue, Amritsar, Punjab'
  },
  {
    name: 'Social and Community Club',
    description: 'Building connections and making a difference in our community. Organize social events, volunteer activities, community service projects, and networking opportunities to strengthen bonds and give back.',
    location: 'Urban Estate Phase 1, Jalandhar, Punjab'
  },
  {
    name: 'Tech and Skill Club',
    description: 'Stay ahead in technology and develop valuable skills. Learn programming, web development, digital marketing, data analysis, and other tech skills through workshops, hackathons, and collaborative projects.',
    location: 'Industrial Area, Mohali, Punjab'
  },
  {
    name: 'Mental Health Awareness Club',
    description: 'A supportive community dedicated to promoting mental wellness, reducing stigma, and providing resources for mental health. Join us for discussions, workshops, peer support groups, and awareness campaigns to foster a caring and understanding environment.',
    location: 'Civil Lines, Patiala, Punjab'
  }
]

async function seedClubs() {
  try {
    await connectDB()
    console.log('🌱 Starting to seed clubs...')

    let created = 0
    let updated = 0

    for (const club of clubs) {
      const existing = await Committee.findOne({ name: club.name })

      if (existing) {
        // Update existing club with location if missing or changed
        existing.location = club.location
        existing.description = club.description // Update description too just in case
        await existing.save()
        console.log(`🔄 Updated: ${club.name}`)
        updated++
      } else {
        await Committee.create(club)
        console.log(`✅ Created: ${club.name}`)
        created++
      }
    }

    console.log(`\n✨ Seeding complete!`)
    console.log(`   Created: ${created} clubs`)
    console.log(`   Updated: ${updated} clubs`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding clubs:', error)
    process.exit(1)
  }
}

// Run the seed function
seedClubs()


