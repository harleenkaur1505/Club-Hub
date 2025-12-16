// scripts/seedClubs.js
// Seed script to initialize the mini clubs in the database
const mongoose = require('mongoose')
const Committee = require('../models/Committee')
require('dotenv').config()

const connectDB = require('../config/db')

const clubs = [
  {
    name: 'Cozy and Lifestyle Club',
    description: 'A welcoming space for members interested in wellness, home decor, cooking, and creating a comfortable, balanced lifestyle. Join us for workshops on mindfulness, interior design, healthy living, and cozy gatherings.'
  },
  {
    name: 'Academic Club',
    description: 'Dedicated to intellectual growth, research, and academic excellence. Participate in study groups, research projects, academic competitions, and scholarly discussions across various disciplines.'
  },
  {
    name: 'Creative and Fun Club',
    description: 'Unleash your creativity! Join us for art workshops, creative writing, music sessions, drama, and fun activities. Perfect for anyone who loves expressing themselves through various creative mediums.'
  },
  {
    name: 'Social and Community Club',
    description: 'Building connections and making a difference in our community. Organize social events, volunteer activities, community service projects, and networking opportunities to strengthen bonds and give back.'
  },
  {
    name: 'Tech and Skill Club',
    description: 'Stay ahead in technology and develop valuable skills. Learn programming, web development, digital marketing, data analysis, and other tech skills through workshops, hackathons, and collaborative projects.'
  },
  {
    name: 'Mental Health Awareness Club',
    description: 'A supportive community dedicated to promoting mental wellness, reducing stigma, and providing resources for mental health. Join us for discussions, workshops, peer support groups, and awareness campaigns to foster a caring and understanding environment.'
  }
]

async function seedClubs() {
  try {
    await connectDB()
    console.log('🌱 Starting to seed clubs...')

    // Check if clubs already exist
    const existingClubs = await Committee.find({ name: { $in: clubs.map(c => c.name) } })
    
    if (existingClubs.length > 0) {
      console.log(`⚠️  Found ${existingClubs.length} existing clubs. Skipping duplicates...`)
    }

    let created = 0
    let skipped = 0

    for (const club of clubs) {
      const existing = await Committee.findOne({ name: club.name })
      
      if (existing) {
        console.log(`⏭️  Skipping "${club.name}" - already exists`)
        skipped++
      } else {
        await Committee.create(club)
        console.log(`✅ Created: ${club.name}`)
        created++
      }
    }

    console.log(`\n✨ Seeding complete!`)
    console.log(`   Created: ${created} clubs`)
    console.log(`   Skipped: ${skipped} clubs (already exist)`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding clubs:', error)
    process.exit(1)
  }
}

// Run the seed function
seedClubs()


