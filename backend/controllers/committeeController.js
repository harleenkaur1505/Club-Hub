// controllers/committeeController.js
//This controller manages committees and their members.
// It supports CRUD operations on committees and ensures proper member assignment, fee tracking, 
// and payment generation when members join paid committees.
const Committee = require('../models/Committee')
const Member = require('../models/Member')

exports.listCommittees = async (req, res, next) => {
  try {
    const committees = await Committee.find().populate('members')
    res.json({ committees })
  } catch (err) {
    next(err)
  }
}

exports.createCommittee = async (req, res, next) => {
  try {
    const committee = await Committee.create(req.body)
    res.status(201).json({ committee })
  } catch (err) {
    next(err)
  }
}

exports.getCommittee = async (req, res, next) => {
  try {
    const c = await Committee.findById(req.params.id).populate('members')
    if (!c) return res.status(404).json({ message: 'Committee not found' })
    res.json({ committee: c })
  } catch (err) {
    next(err)
  }
}

exports.updateCommittee = async (req, res, next) => {
  try {
    const c = await Committee.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!c) return res.status(404).json({ message: 'Committee not found' })
    res.json({ committee: c })
  } catch (err) {
    next(err)
  }
}

exports.deleteCommittee = async (req, res, next) => {
  try {
    const c = await Committee.findByIdAndDelete(req.params.id)
    if (!c) return res.status(404).json({ message: 'Committee not found' })
    res.json({ message: 'Committee removed' })
  } catch (err) {
    next(err)
  }
}

exports.addMemberToCommittee = async (req, res, next) => {
  try {
    const { committeeId } = req.params
    const { memberId } = req.body

    if (!memberId) {
      return res.status(400).json({ message: 'Member ID is required' })
    }

    const committee = await Committee.findById(committeeId)
    if (!committee) {
      return res.status(404).json({ message: 'Committee not found' })
    }

    const member = await Member.findById(memberId)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }

    // Check if member is already in committee
    if (committee.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member is already in this committee' })
    }

    // Add member to committee
    committee.members.push(memberId)
    await committee.save()

    // Add committee to member's committees array
    if (!member.committees.includes(committeeId)) {
      member.committees.push(committeeId)

      // Auto-generate payment request for club fee
      if (committee.fee > 0) {
        const Payment = require('../models/Payment')
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        await Payment.create({
          member: memberId,
          amount: committee.fee,
          type: 'dues',
          status: 'pending', // User needs to pay this
          club: committee.name,
          notes: `Membership fee for ${committee.name}`,
          date: new Date(),
          dueDate: dueDate
        })

        // Update member feesDue
        member.feesDue = (member.feesDue || 0) + committee.fee
      }

      await member.save()
    }

    const updatedCommittee = await Committee.findById(committeeId).populate('members')
    res.json({ committee: updatedCommittee, message: 'Member added successfully' })
  } catch (err) {
    next(err)
  }
}

exports.removeMemberFromCommittee = async (req, res, next) => {
  try {
    const { committeeId, memberId } = req.params

    const committee = await Committee.findById(committeeId)
    if (!committee) {
      return res.status(404).json({ message: 'Committee not found' })
    }

    const member = await Member.findById(memberId)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }

    // Remove member from committee
    committee.members = committee.members.filter(id => id.toString() !== memberId)
    await committee.save()

    // Remove committee from member's committees array
    member.committees = member.committees.filter(id => id.toString() !== committeeId)
    await member.save()

    const updatedCommittee = await Committee.findById(committeeId).populate('members')
    res.json({ committee: updatedCommittee, message: 'Member removed successfully' })
  } catch (err) {
    next(err)
  }
}

exports.cancelMembership = async (req, res, next) => {
  try {
    const { committeeId } = req.params

    const committee = await Committee.findById(committeeId)
    if (!committee) {
      return res.status(404).json({ message: 'Committee not found' })
    }

    const member = await Member.findOne({ email: req.user.email })
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found' })
    }

    const memberId = member._id.toString()

    // Find and calculate pending payments to remove
    const Payment = require('../models/Payment')
    const pendingPayments = await Payment.find({
      member: memberId,
      club: committee.name,
      type: 'dues',
      status: 'pending'
    })

    const totalToRemove = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    // Delete the pending payments
    if (pendingPayments.length > 0) {
      await Payment.deleteMany({ _id: { $in: pendingPayments.map(p => p._id) } })

      // Update member's feesDue
      member.feesDue = Math.max(0, (member.feesDue || 0) - totalToRemove)
    }

    // Remove member from committee
    committee.members = committee.members.filter(id => id.toString() !== memberId)
    await committee.save()

    // Remove committee from member's committees array
    member.committees = member.committees.filter(id => id.toString() !== committeeId)
    await member.save()

    res.json({ message: 'Membership canceled successfully, and pending dues cleared' })
  } catch (err) {
    next(err)
  }
}
