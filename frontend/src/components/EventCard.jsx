import React from 'react'
import dayjs from 'dayjs'

export default function EventCard({ event }) {

  return (
    <div className="backdrop-blur-md p-6 rounded-3xl shadow-lg slide-in-up border border-white/10 relative overflow-hidden group transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl bg-[#442D1C]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-white font-outfit tracking-wide">{event.title}</h3>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm"
          style={{
            backgroundColor: 'rgba(201, 169, 97, 0.2)',
            borderColor: 'rgba(201, 169, 97, 0.5)',
            color: '#E6D08E'
          }}>
          {dayjs(event.date).format('MMM D, YYYY')}
        </span>
      </div>
      <p className="text-white/80 mb-4 font-light leading-relaxed">{event.description}</p>
      <div className="mt-auto border-t border-white/10 pt-4 flex justify-between items-center">
        <div className="text-sm text-white/50 font-mono flex items-center gap-2">
          <span className="text-[#E6D08E]">📍</span>
          <span>{event.venue || 'TBD'}</span>
        </div>
      </div>
    </div>
  )
}
