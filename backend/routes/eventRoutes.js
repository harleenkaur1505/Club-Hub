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
const { protect, admin } = require('../middlewares/authMiddleware')

router.get('/', protect, listEvents)
router.post('/', protect, admin, createEvent)
router.get('/:id', protect, getEvent)
router.put('/:id', protect, admin, updateEvent)
router.delete('/:id', protect, admin, deleteEvent)

module.exports = router
