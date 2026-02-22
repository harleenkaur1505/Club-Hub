//This migration script updates existing member records by adding default values 
//for newly introduced fields, ensuring backward compatibility with the updated schema.
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const Member = require('../models/Member')
const Location = require('../models/Location')
const Committee = require('../models/Committee')

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clubdb')
        console.log('Connected.')

        const members = await Member.find({})
        console.log(`Found ${members.length} members to check.`)

        let updatedCount = 0

        for (const member of members) {
            let changed = false
            if (!member.status) {
                member.status = 'active'
                changed = true
            }
            if (!member.role) {
                member.role = 'Member'
                changed = true
            }
            if (!member.level) {
                member.level = 'General'
                changed = true
            }

            if (changed) {
                await member.save()
                updatedCount++
                console.log(`Updated member: ${member.name}`)
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} members.`)
        process.exit(0)
    } catch (err) {
        console.error('Migration failed:', err)
        process.exit(1)
    }
}

migrate()
