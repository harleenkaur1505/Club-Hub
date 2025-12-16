import React, { useEffect, useState } from 'react'
import { eventsAPI } from '../services/membershipAPI'
import EventCard from '../components/EventCard'
import { Link } from 'react-router-dom'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await eventsAPI.list()
      setEvents(data.events || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">Events</h2>
        <Link 
          to="/events/create" 
          className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          + Create Event
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500 text-lg mb-4">No events found. Create your first event to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => <EventCard key={ev._id} event={ev} />)}
        </div>
      )}
    </div>
  )
}
