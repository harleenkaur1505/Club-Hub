// routes/locationRoutes.js
const express = require('express')
const router = express.Router()
const locationController = require('../controllers/locationController')
const { protect, admin } = require('../middlewares/authMiddleware') // Assuming these exist

router.get('/', protect, locationController.listLocations)
router.post('/', protect, admin, locationController.createLocation)
router.get('/:id', protect, locationController.getLocation)
router.put('/:id', protect, admin, locationController.updateLocation)
router.delete('/:id', protect, admin, locationController.deleteLocation)

module.exports = router
