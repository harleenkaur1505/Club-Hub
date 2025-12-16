import React, { useEffect, useState } from 'react'
import { announcementsAPI, membersAPI, committeesAPI } from '../services/membershipAPI'
import dayjs from 'dayjs'

export default function Announcements() {
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

  if (loading) return <div className="text-center py-8">Loading announcements...</div>

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">Member Communications</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 slide-in-up">
          <h3 className="text-xl font-semibold mb-4">Create Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Message *</label>
              <textarea
                required
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                placeholder="Enter your message here..."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="dues">Dues</option>
                  <option value="urgent">Urgent</option>
                  <option value="committee">Committee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                >
                  <option value="all">All Members</option>
                  <option value="active_members">Active Members Only</option>
                  <option value="committees">Specific Committees</option>
                  <option value="specific">Specific Members</option>
                </select>
              </div>
            </div>
            {formData.targetAudience === 'specific' && (
              <div>
                <label className="block text-sm font-semibold mb-2">Select Members</label>
                <select
                  multiple
                  value={formData.targetMembers}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    targetMembers: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                  size="5"
                >
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
            {formData.targetAudience === 'committees' && (
              <div>
                <label className="block text-sm font-semibold mb-2">Select Committees</label>
                <select
                  multiple
                  value={formData.targetCommittees}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    targetCommittees: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
                  size="5"
                >
                  {committees.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-2">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Send Email Notification</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendSMS}
                  onChange={(e) => setFormData({ ...formData, sendSMS: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Send SMS Notification</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
            >
              Create Announcement
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id} 
            className="bg-white p-6 rounded-lg shadow-lg slide-in-up border-l-4"
            style={{
              borderLeftColor: announcement.priority === 'urgent' ? '#ef4444' :
                              announcement.priority === 'high' ? '#eab308' :
                              announcement.priority === 'normal' ? '#800020' :
                              '#d1d5db'
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{announcement.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: announcement.type === 'urgent' ? '#fee2e2' :
                                      announcement.type === 'event' ? 'rgba(128, 0, 32, 0.1)' :
                                      announcement.type === 'dues' ? '#dcfce7' :
                                      '#f3f4f6',
                      color: announcement.type === 'urgent' ? '#b91c1c' :
                            announcement.type === 'event' ? '#800020' :
                            announcement.type === 'dues' ? '#166534' :
                            '#374151'
                    }}>
                    {announcement.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    announcement.priority === 'high' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{announcement.message}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>📅 {dayjs(announcement.createdAt).format('MMM D, YYYY h:mm A')}</span>
                  <span>👤 {announcement.createdBy?.name || 'Admin'}</span>
                  <span>👁️ {announcement.readBy?.length || 0} reads</span>
                  {announcement.expiresAt && (
                    <span>⏰ Expires: {dayjs(announcement.expiresAt).format('MMM D, YYYY')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleAnnouncementStatus(announcement._id, announcement.isActive)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  announcement.isActive
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {announcement.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500 text-lg">No announcements found. Create your first announcement to communicate with members!</p>
        </div>
      )}
    </div>
  )
}



