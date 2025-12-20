// routes/paymentRoutes.js
const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const { protect, admin } = require('../middlewares/authMiddleware')

router.get('/', protect, paymentController.listPayments)
router.get('/stats', protect, paymentController.getPaymentStats) // Must be before /:id
router.post('/', protect, admin, paymentController.createPayment)
router.put('/:id', protect, paymentController.updatePayment)
router.get('/:id', protect, paymentController.getPayment)

module.exports = router
