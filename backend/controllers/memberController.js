// controllers/memberController.js
const Member = require('../models/Member')

// list with pagination & optional search
exports.listMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query
    const filter = { isDeleted: false }
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }]
    const members = await Member.find(filter)
      .populate('location', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
    const total = await Member.countDocuments(filter)
    res.json({ members, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
}

exports.createMember = async (req, res, next) => {
  try {
    const payload = req.body
    const member = await Member.create(payload)
    res.status(201).json({ member })
  } catch (err) {
    next(err)
  }
}

exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('committees')
      .populate('location')
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ member })
  } catch (err) {
    next(err)
  }
}

exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ member })
  } catch (err) {
    next(err)
  }
}

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true })
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ message: 'Member removed' })
  } catch (err) {
    next(err)
  }
}
