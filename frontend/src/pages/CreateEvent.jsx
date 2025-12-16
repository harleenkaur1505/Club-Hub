import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsAPI } from '../services/membershipAPI'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await eventsAPI.create({ title, date, venue, description })
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event')
    }
  }

  return (
    <div className="max-w-2xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="w-full border rounded p-2" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border rounded p-2" />
        <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" className="w-full border rounded p-2" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border rounded p-2" />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
      </form>
    </div>
  )
}
