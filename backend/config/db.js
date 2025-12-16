// config/db.js
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/clubdb'
    
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    }

    await mongoose.connect(uri, options)
    console.log('✅ MongoDB connected successfully')
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('💡 Make sure MongoDB is running or check your MONGO_URI in .env file')
    console.error('💡 For local MongoDB: mongodb://localhost:27017/clubdb')
    console.error('💡 For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/clubdb')
    
    // Don't exit in development - allow server to start and show helpful message
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.warn('⚠️  Server will continue but database operations will fail until MongoDB is connected')
    }
  }
}

module.exports = connectDB
