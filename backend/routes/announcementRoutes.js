// routes/announcementRoutes.js
const express = require('express')
const router = express.Router()
const announcementController = require('../controllers/announcementController')
const { protect, admin } = require('../middlewares/authMiddleware')

router.get('/', protect, announcementController.listAnnouncements)
router.post('/', protect, admin, announcementController.createAnnouncement)
router.put('/:id', protect, admin, announcementController.updateAnnouncement)

module.exports = router
