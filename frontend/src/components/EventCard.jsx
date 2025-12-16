import React from 'react'
import dayjs from 'dayjs'

export default function EventCard({ event }) {

  return (
    <div className="p-4 bg-white rounded shadow event-card slide-in-up hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <span className="text-sm bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-1 rounded-full text-white font-medium shadow-md">
          {dayjs(event.date).format('MMM D, YYYY')}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 mb-3">{event.description}</p>
      <div className="mt-3 flex justify-between items-center">
        <div className="text-sm text-gray-700 flex items-center gap-2">
          <span className="font-semibold">Venue:</span>
          <span>{event.venue || 'TBD'}</span>
        </div>
      </div>
    </div>
  )
}
