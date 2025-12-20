import React, { useEffect, useState } from 'react'
import { paymentsAPI, membersAPI } from '../services/membershipAPI'
import ConfirmationModal from '../components/ConfirmationModal'
import dayjs from 'dayjs'
import { useAuth } from '../hooks/useAuth'

export default function Payments() {
  const { user } = useAuth()
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

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [error, setError] = useState(null)

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
      setError('Failed to load data. Please try again.')
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

  const handleConfirmPayment = async () => {
    if (!selectedPaymentId) return
    try {
      await paymentsAPI.update(selectedPaymentId, { status: 'completed' })
      loadData()
      setIsConfirmModalOpen(false)
      setSelectedPaymentId(null)
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h1 className="text-6xl md:text-7xl font-thin font-outfit text-[#442D1C] tracking-[0.1em] drop-shadow-sm py-6">
          Payments
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-8 py-4 rounded-xl font-bold font-outfit tracking-wider transition-all transform hover:scale-105 shadow-lg ${showForm ? 'bg-[#84592B]/20 text-[#442D1C] border border-[#84592B]/20 hover:bg-[#84592B]/30' : 'bg-[#84592B] text-[#442D1C] hover:bg-[#A67C52] hover:shadow-[0_0_20px_rgba(132,89,43,0.4)]'}`}
          >
            {showForm ? 'Cancel' : '+ Record Payment'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#442D1C]/50 animate-pulse font-outfit tracking-widest uppercase">Loading payments...</div>
      ) : (
        <>
          {stats && (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-[#442D1C]/5 backdrop-blur-sm p-6 rounded-3xl border border-[#442D1C]/10 shadow-lg">
                <div className="text-sm text-[#442D1C]/60 uppercase tracking-widest mb-2 font-semibold">Total Collected</div>
                <div className="text-3xl font-bold text-[#442D1C] font-outfit">
                  ₹{stats.overall?.totalAmount?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-[#442D1C]/5 backdrop-blur-sm p-6 rounded-3xl border border-[#442D1C]/10 shadow-lg">
                <div className="text-sm text-[#442D1C]/60 uppercase tracking-widest mb-2 font-semibold">Total Payments</div>
                <div className="text-3xl font-bold text-[#442D1C] font-outfit">{stats.overall?.totalCount || 0}</div>
              </div>
              <div className="bg-[#442D1C]/5 backdrop-blur-sm p-6 rounded-3xl border border-[#442D1C]/10 shadow-lg">
                <div className="text-sm text-[#442D1C]/60 uppercase tracking-widest mb-2 font-semibold">Avg. Payment</div>
                <div className="text-3xl font-bold text-[#442D1C] font-outfit">
                  ₹{stats.overall?.avgAmount?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-[#442D1C]/5 backdrop-blur-sm p-6 rounded-3xl border border-[#442D1C]/10 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E6D08E]/20 to-transparent pointer-events-none" />
                <div className="text-sm text-[#442D1C]/60 uppercase tracking-widest mb-2 font-semibold relative z-10">Dues Collected</div>
                <div className="text-3xl font-bold text-[#84592B] font-outfit relative z-10">
                  ₹{stats.byType?.find(s => s._id === 'dues')?.total?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#442D1C] p-8 rounded-3xl shadow-xl mb-12 border border-white/10">
            <h3 className="text-white font-outfit text-xl mb-6 tracking-wider font-light uppercase">Filter Payments</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {user?.role === 'admin' && (
                <select
                  value={filters.member}
                  onChange={(e) => setFilters({ ...filters, member: e.target.value })}
                  className="payment-input w-full rounded-xl p-3 focus:outline-none transition-all"
                >
                  <option value="">All Members</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              )}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="payment-input w-full rounded-xl p-3 focus:outline-none transition-all"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filters.paymentType}
                onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
                className="payment-input w-full rounded-xl p-3 focus:outline-none transition-all"
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
                className="payment-input w-full rounded-xl p-3 focus:outline-none transition-all"
              />
            </div>
          </div>

          {showForm && (
            <div className="bg-[#442D1C] p-10 rounded-3xl shadow-2xl mb-12 slide-in-up relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <h3 className="font-thin text-4xl mb-8 text-white font-outfit tracking-widest uppercase">Record New Payment</h3>
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Member *</label>
                    <select
                      required
                      value={formData.member}
                      onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                    >
                      <option value="">Select Member</option>
                      {members.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {/* ... (Other form fields similarly styled) ... */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Type *</label>
                    <select
                      required
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                    >
                      <option value="dues" className="bg-[#442D1C]">Dues</option>
                      <option value="event" className="bg-[#442D1C]">Event</option>
                      <option value="donation" className="bg-[#442D1C]">Donation</option>
                      <option value="other" className="bg-[#442D1C]">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Method *</label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                    >
                      <option value="cash" className="bg-[#442D1C]">Cash</option>
                      <option value="check" className="bg-[#442D1C]">Check</option>
                      <option value="card" className="bg-[#442D1C]">Card</option>
                      <option value="online" className="bg-[#442D1C]">Online</option>
                      <option value="bank_transfer" className="bg-[#442D1C]">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Status *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                    >
                      <option value="completed" className="bg-[#442D1C]">Completed</option>
                      <option value="pending" className="bg-[#442D1C]">Pending</option>
                      <option value="failed" className="bg-[#442D1C]">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Notes</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="payment-input w-full rounded-xl p-4 focus:outline-none transition-all"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-[#442D1C] p-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 mt-4 relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)'
                  }}
                >
                  <span className="relative z-10">Record Payment</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>
            </div>
          )}

          <div className="grid gap-6">
            {payments.length === 0 ? (
              <div className="text-center py-24 bg-[#442D1C] rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="text-6xl mb-6 opacity-20">💳</div>
                  <p className="text-white text-2xl font-thin font-outfit tracking-wider mb-2">No payments records</p>
                  <p className="text-white/40 text-sm">Valid payments will appear here.</p>
                </div>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment._id} className="bg-[#442D1C]/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-[#442D1C]/60 transition-all group shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-[#5D3E26] flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {payment.paymentType === 'dues' ? '📅' : payment.paymentType === 'donation' ? '🎁' : '🎫'}
                    </div>
                    <div>
                      <h4 className="text-white font-outfit font-semibold text-lg">{payment.member?.name || 'Unknown Member'}</h4>
                      <p className="text-white/50 text-sm capitalize">{payment.paymentType} • {payment.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-[#C9A961] font-bold text-xl font-outfit">₹{payment.amount.toFixed(2)}</div>
                      <div className="text-white/40 text-xs">{dayjs(payment.paymentDate).format('MMM D, YYYY')}</div>
                    </div>

                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${payment.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                      {payment.status}
                    </div>

                    {payment.status === 'pending' && user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedPaymentId(payment._id)
                          setIsConfirmModalOpen(true)
                        }}
                        className="bg-[#C9A961] text-[#442D1C] p-2 rounded-lg hover:bg-[#E6D08E] transition-colors shadow-lg"
                        title="Mark as Paid"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setSelectedPaymentId(null)
        }}
        onConfirm={handleConfirmPayment}
        title="Confirm Payment"
        message="Are you sure you want to mark this payment as paid? This action will update the status to completed."
      />
    </div>
  )
}



