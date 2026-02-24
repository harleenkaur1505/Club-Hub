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
  removeMemberFromCommittee,
  cancelMembership
} = require('../controllers/committeeController')
const { protect, admin } = require('../middlewares/authMiddleware')
const { requireBody } = require('../middlewares/validateRequest')

router.get('/', protect, listCommittees)
router.post('/', protect, admin, requireBody(['name']), createCommittee)
router.get('/:id', protect, getCommittee)
router.put('/:id', protect, admin, updateCommittee)
router.delete('/:id', protect, admin, deleteCommittee)
router.post('/:committeeId/members', protect, requireBody(['memberId']), addMemberToCommittee)
router.delete('/:committeeId/members/:memberId', protect, admin, removeMemberFromCommittee)
router.delete('/:committeeId/cancel', protect, cancelMembership)

module.exports = router
