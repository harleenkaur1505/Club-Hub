// routes/eventRoutes.js
const express = require('express')
const router = express.Router()
const {
  listEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController')
const { protect } = require('../middlewares/authMiddleware')

router.get('/', protect, listEvents)
router.post('/', protect, createEvent)
router.get('/:id', protect, getEvent)
router.put('/:id', protect, updateEvent)
router.delete('/:id', protect, deleteEvent)

module.exports = router
