// controllers/paymentController.js
//This controller manages payments with role-based access, ensures accurate fee tracking,
//prevents duplicate deductions, and provides detailed payment statistics using MongoDB aggregation.
const Payment = require('../models/Payment')
const Member = require('../models/Member')
const mongoose = require('mongoose')

exports.listPayments = async (req, res, next) => {
    try {
        const { memberId, status, paymentType, startDate, endDate } = req.query
        const filter = {}

        // RBAC: If not admin, restrict to own member ID
        if (req.user.role !== 'admin') {
            // Find member profile by email
            const memberProfile = await Member.findOne({ email: req.user.email })
            if (!memberProfile) {
                // If user has no member profile, they have no payments
                return res.json({ payments: [] })
            }
            filter.member = memberProfile._id
        } else {
            // Admin can filter by any memberId
            if (memberId) filter.member = memberId
        }

        if (status) filter.status = status
        if (paymentType) filter.type = paymentType
        if (startDate || endDate) {
            filter.date = {}
            if (startDate) filter.date.$gte = new Date(startDate)
            if (endDate) filter.date.$lte = new Date(endDate)
        }

        const payments = await Payment.find(filter).populate('member', 'name').sort({ date: -1 })
        res.json({ payments })
    } catch (err) {
        next(err)
    }
}

exports.createPayment = async (req, res, next) => {
    try {
        const { member, amount, paymentType } = req.body

        const payload = { ...req.body }
        const payment = await Payment.create(payload)

        // Only decrement dues if the payment is ALREADY completed (e.g. by admin)
        if (payload.type === 'dues' && payload.status === 'completed') {
            await Member.findByIdAndUpdate(member, { $inc: { feesDue: -amount } })
        }

        res.status(201).json(payment)
    } catch (err) {
        next(err)
    }
}

exports.getPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('member', 'name')
        if (!payment) return res.status(404).json({ message: 'Payment not found' })
        res.json(payment)
    } catch (err) {
        next(err)
    }
}

exports.updatePayment = async (req, res, next) => {
    try {
        let payment = await Payment.findById(req.params.id)
        if (!payment) return res.status(404).json({ message: 'Payment not found' })

        // Check Permissions
        if (req.user.role !== 'admin') {
            const memberProfile = await Member.findOne({ email: req.user.email })
            if (!memberProfile || !payment.member.equals(memberProfile._id)) {
                return res.status(403).json({ message: 'Not authorized to update this payment' })
            }
        }
        const oldStatus = payment.status

        // Perform Update
        payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('member', 'name')

        // Only decrement fees if it transitions FROM not-completed TO completed
        if (payment.status === 'completed' && oldStatus !== 'completed' && payment.type === 'dues') {
            await Member.findByIdAndUpdate(payment.member._id, { $inc: { feesDue: -payment.amount } })
        }

        res.json(payment)
    } catch (err) {
        next(err)
    }
}

exports.getPaymentStats = async (req, res, next) => {
    try {
        const { startDate, endDate, memberId } = req.query
        const match = {}

        // RBAC: If not admin, restrict to own member ID
        if (req.user.role !== 'admin') {
            const memberProfile = await Member.findOne({ email: req.user.email })
            if (!memberProfile) {
                return res.json({
                    overall: { totalAmount: 0, totalCount: 0, avgAmount: 0, pendingAmount: 0 },
                    byType: []
                })
            }
            match.member = memberProfile._id
        } else {
            // Admin can filter by any memberId if provided
            if (memberId) match.member = new mongoose.Types.ObjectId(memberId)
        }

        if (startDate || endDate) {
            match.date = {}
            if (startDate) match.date.$gte = new Date(startDate)
            if (endDate) match.date.$lte = new Date(endDate)
        }

        const stats = await Payment.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalCount: { $sum: 1 },
                    avgAmount: { $avg: '$amount' },
                    pendingAmount: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
                    }
                }
            }
        ])

        const byType = await Payment.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ])

        res.json({
            overall: stats[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0, pendingAmount: 0 },
            byType
        })
    } catch (err) {
        next(err)
    }
}
