// controllers/memberController.js
const Member = require('../models/Member')
//This controller manages club members with pagination, search,
// role-based data access, committee-based fee generation, and soft deletion for data safety.
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

    // Filter sensitive data for non-admins
    const sanitizedMembers = members.map(m => {
      const memberObj = m.toObject()
      if (req.user.role !== 'admin') {
        delete memberObj.feesDue
        delete memberObj.address
      }
      return memberObj
    })

    res.json({ members: sanitizedMembers, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
}

exports.createMember = async (req, res, next) => {
  try {
    const payload = req.body
    const member = await Member.create(payload)

    // Check if committees were assigned during creation
    if (payload.committees && payload.committees.length > 0) {
      const Committee = require('../models/Committee')
      const Payment = require('../models/Payment')

      const committees = await Committee.find({ _id: { $in: payload.committees } })

      let feesAdded = 0

      for (const committee of committees) {
        if (committee.fee > 0) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 3);

          await Payment.create({
            member: member._id,
            amount: committee.fee,
            type: 'dues',
            status: 'pending',
            club: committee.name,
            notes: `Membership fee for ${committee.name}`,
            date: new Date(),
            dueDate: dueDate
          })
          feesAdded += committee.fee
        }
      }

      if (feesAdded > 0) {
        member.feesDue = (member.feesDue || 0) + feesAdded
        await member.save()
      }
    }

    res.status(201).json({ member })
  } catch (err) {
    next(err)
  }
}

exports.getMember = async (req, res, next) => {
  try {
    let member = await Member.findById(req.params.id)
      .populate('committees')
      .populate('location')

    if (!member) return res.status(404).json({ message: 'Member not found' })

    // Filter sensitive data for non-admins
    if (req.user.role !== 'admin') {
      member = member.toObject()
      delete member.feesDue
      delete member.address
    }

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
