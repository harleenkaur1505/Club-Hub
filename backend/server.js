// server.js
require('dotenv').config()
const path = require('path')
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')

// routes
const authRoutes = require('./routes/authRoutes')
const memberRoutes = require('./routes/memberRoutes')
const eventRoutes = require('./routes/eventRoutes')
const committeeRoutes = require('./routes/committeeRoutes')
const locationRoutes = require('./routes/locationRoutes')

const paymentRoutes = require('./routes/paymentRoutes')
const announcementRoutes = require('./routes/announcementRoutes')

// utils
const connectDB = require('./config/db')
const { errorHandler } = require('./middlewares/errorHandler')
const { initChatSocket } = require('./socket/chatSocket')

const app = express()
const server = http.createServer(app)

const io = require('socket.io')(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
})

// Connect DB
connectDB().then(async () => {
  // Run seeding scripts after successful DB connection
  const seedCozyEvents = require('./scripts/seedCozyEvents');
  const seedCreativeEvents = require('./scripts/seedCreativeEvents');
  const seedAcademicEvents = require('./scripts/seedAcademicEvents');
  const seedSocialEvents = require('./scripts/seedSocialEvents');
  const seedTechEvents = require('./scripts/seedTechEvents');
  const seedMentalHealthEvents = require('./scripts/seedMentalHealthEvents');
  const seedLocations = require('./scripts/seedLocations');

  await seedCozyEvents();
  await seedCreativeEvents();
  await seedAcademicEvents();
  await seedSocialEvents();
  await seedTechEvents();
  await seedMentalHealthEvents();
  await seedLocations();

});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
  crossOriginEmbedderPolicy: false
}))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ]

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

    if (allowedOrigins.indexOf(origin) !== -1 || isDev) {
      callback(null, true)
    } else {
      console.error('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}

app.use(cors(corsOptions))

// Session (cookie-based)
app.use(
  session({
    name: 'club.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/committees', committeeRoutes)
app.use('/api/locations', locationRoutes)

app.use('/api/payments', paymentRoutes)
app.use('/api/announcements', announcementRoutes)



// static upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// DEBUG: Expose seed log
const fs = require('fs');
app.get('/api/debug-log', (req, res) => {
  try {
    const logContent = fs.readFileSync(path.join(__dirname, 'seed.log'), 'utf8');
    res.send(logContent);
  } catch (e) {
    res.status(500).send('Error reading log: ' + e.message);
  }
});

// Error handler (must be last)
app.use(errorHandler)

// sockets
initChatSocket(io)

// Start server
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || 'localhost'

server.listen(PORT, HOST, () => {
  console.log('\n🚀 Server started successfully!')
  console.log(`📍 Server running on http://${HOST}:${PORT}`)
  console.log(`🌐 Frontend should connect to: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`)
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`)
  console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})
