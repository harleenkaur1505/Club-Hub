// routes/memberRoutes.js
const express = require('express')
const router = express.Router()
const {
  listMembers,
  createMember,
  getMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController')
const { protect } = require('../middlewares/authMiddleware')
const { requireBody } = require('../middlewares/validateRequest')

router.get('/', protect, listMembers)
router.post('/', protect, requireBody(['name']), createMember)
router.get('/:id', protect, getMember)
router.put('/:id', protect, updateMember)
router.delete('/:id', protect, deleteMember)

module.exports = router
