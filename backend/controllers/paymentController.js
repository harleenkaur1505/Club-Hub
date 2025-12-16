// controllers/paymentController.js
const Payment = require('../models/Payment')
const Member = require('../models/Member')

exports.listPayments = async (req, res, next) => {
    try {
        const { memberId, status, paymentType, startDate, endDate } = req.query
        const filter = {}
        if (memberId) filter.member = memberId
        if (status) filter.status = status
        if (paymentType) filter.type = paymentType // Frontend sends 'paymentType', model uses 'type'? Check model.
        // Model uses 'type'. Frontend filters send 'paymentType'.
        if (startDate || endDate) {
            filter.date = {}
            if (startDate) filter.date.$gte = new Date(startDate)
            if (endDate) filter.date.$lte = new Date(endDate)
        }

        const payments = await Payment.find(filter).populate('member', 'name').sort({ date: -1 })
        res.json({ payments }) // Frontend expects object { payments: [] }? Let's check frontend.
        // Frontend: const { data } = await paymentsAPI.list(filters); setPayments(data.payments || [])
        // So yes, res.json({ payments })
    } catch (err) {
        next(err)
    }
}

exports.createPayment = async (req, res, next) => {
    try {
        const { member, amount, paymentType } = req.body

        const payload = {
            ...req.body,
            type: paymentType || req.body.type // Map paymentType to type
        }

        const payment = await Payment.create(payload)

        if (payload.type === 'dues') {
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

exports.getPaymentStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query
        const match = {}
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
                    avgAmount: { $avg: '$amount' }
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
            overall: stats[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
            byType
        })
    } catch (err) {
        next(err)
    }
}
