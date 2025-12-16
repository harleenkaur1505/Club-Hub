import React, { useEffect, useState } from 'react'
import { paymentsAPI, membersAPI } from '../services/membershipAPI'
import dayjs from 'dayjs'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    member: '',
    amount: '',
    paymentType: 'dues',
    paymentMethod: 'cash',
    paymentDate: dayjs().format('YYYY-MM-DD'),
    dueDate: '',
    status: 'completed',
    receiptNumber: '',
    notes: ''
  })
  const [filters, setFilters] = useState({
    member: '',
    status: '',
    paymentType: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      const [paymentsRes, membersRes, statsRes] = await Promise.all([
        paymentsAPI.list(filters),
        membersAPI.list(),
        paymentsAPI.getStats(filters)
      ])
      setPayments(paymentsRes.data.payments || [])
      setMembers(membersRes.data.members || [])
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate) : new Date(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      await paymentsAPI.create(payload)
      setShowForm(false)
      setFormData({
        member: '',
        amount: '',
        paymentType: 'dues',
        paymentMethod: 'cash',
        paymentDate: dayjs().format('YYYY-MM-DD'),
        dueDate: '',
        status: 'completed',
        receiptNumber: '',
        notes: ''
      })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment')
    }
  }

  if (loading) return <div className="text-center py-8">Loading payments...</div>

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">Dues & Payments</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Total Collected</div>
            <div className="text-2xl font-bold text-green-600">
              ${stats.overall?.totalAmount?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Total Payments</div>
            <div className="text-2xl font-bold">{stats.overall?.totalCount || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Average Payment</div>
            <div className="text-2xl font-bold">
              ${stats.overall?.avgAmount?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Dues Collected</div>
            <div className="text-2xl font-bold" style={{ color: '#800020' }}>
              ${stats.byType?.find(s => s._id === 'dues')?.total?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <select
            value={filters.member}
            onChange={(e) => setFilters({ ...filters, member: e.target.value })}
            className="border-2 border-gray-200 rounded-lg p-2"
          >
            <option value="">All Members</option>
            {members.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border-2 border-gray-200 rounded-lg p-2"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.paymentType}
            onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
            className="border-2 border-gray-200 rounded-lg p-2"
          >
            <option value="">All Types</option>
            <option value="dues">Dues</option>
            <option value="event">Event</option>
            <option value="donation">Donation</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start Date"
            className="border-2 border-gray-200 rounded-lg p-2"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 slide-in-up">
          <h3 className="text-xl font-semibold mb-4">Record New Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Member *</label>
                <select
                  required
                  value={formData.member}
                  onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Type *</label>
                <select
                  required
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="dues">Dues</option>
                  <option value="event">Event</option>
                  <option value="donation">Donation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method *</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Receipt Number</label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="w-full text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
            >
              Record Payment
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {dayjs(payment.paymentDate).format('MMM D, YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.member?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                    {payment.paymentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                    {payment.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.receiptNumber || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  )
}



