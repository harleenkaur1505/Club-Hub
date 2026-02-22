import React, { useEffect, useState } from 'react'
import { announcementsAPI, membersAPI, committeesAPI } from '../services/membershipAPI'
import dayjs from 'dayjs'
import { useAuth } from '../hooks/useAuth'

export default function Announcements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [members, setMembers] = useState([])
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)


  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetAudience: 'all',
    targetMembers: [],
    targetCommittees: [],
    sendEmail: false,
    sendSMS: false,
    expiresAt: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [announcementsRes, membersRes, committeesRes] = await Promise.all([
        announcementsAPI.list({ isActive: true }),
        membersAPI.list(),
        committeesAPI.list()
      ])
      setAnnouncements(announcementsRes.data.announcements || [])
      setMembers(membersRes.data.members || [])
      setCommittees(committeesRes.data.committees || [])
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
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        targetMembers: formData.targetAudience === 'specific' ? formData.targetMembers : undefined,
        targetCommittees: formData.targetAudience === 'committees' ? formData.targetCommittees : undefined
      }
      await announcementsAPI.create(payload)
      setShowForm(false)
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'normal',
        targetAudience: 'all',
        targetMembers: [],
        targetCommittees: [],
        sendEmail: false,
        sendSMS: false,
        expiresAt: ''
      })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create announcement')
    }
  }

  const toggleAnnouncementStatus = async (id, currentStatus) => {
    try {
      await announcementsAPI.update(id, { isActive: !currentStatus })
      loadData()
    } catch (err) {
      alert('Failed to update announcement')
    }
  }

  if (loading) return <div className="text-center py-20 text-[#442D1C]/50 animate-pulse font-outfit tracking-widest uppercase">Loading announcements...</div>

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h1 className="text-4xl md:text-6xl font-thin font-outfit text-[#442D1C] tracking-[0.1em] drop-shadow-sm py-6 text-center md:text-left leading-tight">
          Member<br />Communications
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-8 py-4 rounded-xl font-bold font-outfit tracking-wider transition-all transform hover:scale-105 shadow-lg ${showForm ? 'bg-[#442D1C]/20 text-[#442D1C] border border-[#442D1C]/20 hover:bg-[#442D1C]/30' : 'bg-[#442D1C] text-white hover:bg-[#5D3E26] hover:shadow-[0_0_20px_rgba(68,45,28,0.4)]'}`}
          >
            {showForm ? 'Cancel' : '+ New Announcement'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#442D1C] p-10 rounded-3xl shadow-2xl mb-12 slide-in-up relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h3 className="font-thin text-4xl mb-8 text-white font-outfit tracking-widest uppercase">Create Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Message *</label>
              <textarea
                required
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
                placeholder="Enter your message here..."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
                >
                  <option className="bg-[#442D1C] text-black" value="general">General</option>
                  <option className="bg-[#442D1C] text-black" value="event">Event</option>
                  <option className="bg-[#442D1C] text-black" value="dues">Dues</option>
                  <option className="bg-[#442D1C] text-black" value="urgent">Urgent</option>
                  <option className="bg-[#442D1C] text-black" value="committee">Committee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
                >
                  <option className="bg-[#442D1C] text-black" value="low">Low</option>
                  <option className="bg-[#442D1C] text-black" value="normal">Normal</option>
                  <option className="bg-[#442D1C] text-black" value="high">High</option>
                  <option className="bg-[#442D1C] text-black" value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
                >
                  <option className="bg-[#442D1C] text-black" value="all">All Members</option>
                  <option className="bg-[#442D1C] text-black" value="active_members">Active Members Only</option>
                  <option className="bg-[#442D1C] text-black" value="committees">Specific Committees</option>
                  <option className="bg-[#442D1C] text-black" value="specific">Specific Members</option>
                </select>
              </div>
            </div>
            {formData.targetAudience === 'specific' && (
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Select Members</label>
                <select
                  multiple
                  value={formData.targetMembers}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetMembers: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm h-32"
                >
                  {members.map(m => (
                    <option className="bg-[#442D1C] text-black" key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-xs text-white/40 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
            {formData.targetAudience === 'committees' && (
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Select Committees</label>
                <select
                  multiple
                  value={formData.targetCommittees}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetCommittees: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm h-32"
                >
                  {committees.map(c => (
                    <option className="bg-[#442D1C] text-black" key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-white/40 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="login-input w-full bg-[#442D1C] border border-[#84592B]/50 text-white rounded-xl p-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26] backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="w-5 h-5 rounded border-[#C9A961] text-[#C9A961] focus:ring-[#C9A961]"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">Send Email Notification</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.sendSMS}
                  onChange={(e) => setFormData({ ...formData, sendSMS: e.target.checked })}
                  className="w-5 h-5 rounded border-[#C9A961] text-[#C9A961] focus:ring-[#C9A961]"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">Send SMS Notification</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full text-[#442D1C] p-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 mt-4 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)'
              }}
            >
              <span className="relative z-10">Create Announcement</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className="backdrop-blur-md p-8 rounded-3xl shadow-lg slide-in-up border border-white/10 relative overflow-hidden group transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl"
            style={{
              background: '#442D1C',
              borderLeft: `6px solid ${announcement.priority === 'urgent' ? '#ef4444' :
                announcement.priority === 'high' ? '#eab308' :
                  '#C9A961'
                }`
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white font-outfit tracking-wide">{announcement.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: announcement.type === 'urgent' ? 'rgba(239, 68, 68, 0.2)' :
                        announcement.type === 'event' ? 'rgba(201, 169, 97, 0.2)' :
                          'rgba(255, 255, 255, 0.1)',
                      borderColor: announcement.type === 'urgent' ? 'rgba(239, 68, 68, 0.5)' :
                        announcement.type === 'event' ? 'rgba(201, 169, 97, 0.5)' :
                          'rgba(255, 255, 255, 0.2)',
                      color: announcement.type === 'urgent' ? '#fca5a5' :
                        announcement.type === 'event' ? '#E6D08E' :
                          '#e5e7eb'
                    }}>
                    {announcement.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${announcement.priority === 'urgent' ? 'bg-red-500/20 border-red-500/50 text-red-300' :
                    announcement.priority === 'high' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' :
                      'bg-white/10 border-white/20 text-gray-300'
                    }`}>
                    {announcement.priority}
                  </span>
                </div>

                <p className="text-white/80 mb-6 whitespace-pre-wrap leading-relaxed text-lg font-light">{announcement.message}</p>

                <div className="flex flex-wrap gap-6 text-sm text-white/40 font-mono">
                  <span className="flex items-center gap-2">📅 {dayjs(announcement.createdAt).format('MMM D, YYYY h:mm A')}</span>
                  <span className="flex items-center gap-2">👤 {announcement.createdBy?.name || 'Admin'}</span>
                  {announcement.expiresAt && (
                    <span className="flex items-center gap-2 text-yellow-500/70">⏰ Expires: {dayjs(announcement.expiresAt).format('MMM D, YYYY')}</span>
                  )}
                </div>
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => toggleAnnouncementStatus(announcement._id, announcement.isActive)}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all border ${announcement.isActive
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/20'
                    : 'bg-green-500/10 text-green-500 border-green-500/50 hover:bg-green-500/20'
                    }`}
                >
                  {announcement.isActive ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-24 bg-[#442D1C] rounded-3xl shadow-2xl relative overflow-hidden border border-white/5 mx-auto max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="text-6xl mb-6 opacity-20">📢</div>
            <p className="text-white text-3xl font-thin font-outfit tracking-wider mb-4">No announcements yet</p>
            <p className="text-white/40 text-lg">Stay tuned for updates!</p>
          </div>
        </div>
      )}
    </div>
  )
}



