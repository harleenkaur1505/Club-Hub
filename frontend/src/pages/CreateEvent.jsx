import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsAPI, committeesAPI } from '../services/membershipAPI'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [description, setDescription] = useState('')
  const [committee, setCommittee] = useState('')
  const [committees, setCommittees] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadCommittees()
  }, [])

  const loadCommittees = async () => {
    try {
      const { data } = await committeesAPI.list()
      setCommittees(data.committees || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await eventsAPI.create({
        title,
        date,
        venue,
        description,
        committee: committee || undefined
      })
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event')
    }
  }

  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl shadow-lg mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-6 gradient-text">Create Event</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Gala" required className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 transition" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Main Hall" className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Club (Optional)</label>
          <select
            value={committee}
            onChange={(e) => setCommittee(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 transition bg-white"
          >
            <option value="">-- General Event (No Specific Club) --</option>
            {committees.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event details..." rows="4" className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 transition" />
        </div>

        <button
          type="submit"
          className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #442D1C 0%, #5D3E26 50%, #C9A961 100%)' }}
        >
          Create Event
        </button>
      </form>
    </div>
  )
}
