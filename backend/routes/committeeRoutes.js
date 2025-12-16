// routes/committeeRoutes.js
const express = require('express')
const router = express.Router()
const {
  listCommittees,
  createCommittee,
  getCommittee,
  updateCommittee,
  deleteCommittee,
  addMemberToCommittee,
  removeMemberFromCommittee
} = require('../controllers/committeeController')
const { protect } = require('../middlewares/authMiddleware')
const { requireBody } = require('../middlewares/validateRequest')

router.get('/', protect, listCommittees)
router.post('/', protect, requireBody(['name']), createCommittee)
router.get('/:id', protect, getCommittee)
router.put('/:id', protect, updateCommittee)
router.delete('/:id', protect, deleteCommittee)
router.post('/:committeeId/members', protect, requireBody(['memberId']), addMemberToCommittee)
router.delete('/:committeeId/members/:memberId', protect, removeMemberFromCommittee)

module.exports = router
