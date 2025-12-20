import React, { useEffect, useState } from 'react'
import { eventsAPI } from '../services/membershipAPI'
import EventCard from '../components/EventCard'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await eventsAPI.list({ upcoming: true })
      setEvents(data.events || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="mb-12 py-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl md:text-7xl font-thin font-outfit text-[#442D1C] tracking-[0.05em] drop-shadow-sm mb-4 leading-tight">
            Events
          </h1>
          <p className="text-xl md:text-2xl text-[#442D1C]/70 italic font-light tracking-wide">
            Plan, coordinate and attend the best gatherings
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/events/create"
            className="px-8 py-4 bg-[#84592B] text-[#442D1C] rounded-xl font-bold font-outfit tracking-wider shadow-lg hover:bg-[#A67C52] hover:shadow-[0_0_20px_rgba(132,89,43,0.4)] transition-all transform hover:scale-105 inline-block text-center"
          >
            + Create Event
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#442D1C]/50 animate-pulse font-outfit tracking-widest uppercase">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-[#442D1C] rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="text-6xl mb-6 opacity-20">📅</div>
            <p className="text-white text-2xl font-thin font-outfit tracking-wider mb-2">No events found</p>
            <p className="text-white/40 text-sm italic font-light">Create your first event to get started!</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(ev => <EventCard key={ev._id} event={ev} />)}
        </div>
      )}
    </div>
  )
}
