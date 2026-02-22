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
    <div className="max-w-2xl bg-[#442D1C] p-10 rounded-3xl shadow-2xl mx-auto mt-8 relative overflow-hidden border border-white/5 animate-fade-in">
      <style>{`
        /* High specificity to override global styles */
        body div input.force-dark-input,
        body div textarea.force-dark-input,
        body div select.force-dark-input {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        body div input.force-dark-input:focus,
        body div textarea.force-dark-input:focus,
        body div select.force-dark-input:focus {
          border-color: #C9A961 !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .force-dark-input::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }
        /* Override browser autofill to match dark theme */
        .force-dark-input:-webkit-autofill,
        .force-dark-input:-webkit-autofill:hover, 
        .force-dark-input:-webkit-autofill:focus, 
        .force-dark-input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #4a332a inset !important;
            -webkit-text-fill-color: white !important;
        }
      `}</style>
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6D08E]/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A961]/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

      <h2 className="text-4xl font-thin mb-8 text-white font-outfit tracking-widest uppercase relative z-10">Create Event</h2>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl mb-6 backdrop-blur-sm relative z-10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Event Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Gala"
            required
            className="w-full rounded-xl p-4 transition-all font-outfit force-dark-input"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Date</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl p-4 transition-all font-outfit [color-scheme:light] force-dark-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Venue</label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Hall"
              className="w-full rounded-xl p-4 transition-all font-outfit force-dark-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Select Club (Optional)</label>
          <select
            value={committee}
            onChange={(e) => setCommittee(e.target.value)}
            className="w-full rounded-xl p-4 transition-all font-outfit appearance-none cursor-pointer force-dark-input"
          >
            <option value="" className="bg-[#442D1C] text-white">-- General Event (No Specific Club) --</option>
            {committees.map(c => (
              <option key={c._id} value={c._id} className="bg-[#442D1C] text-white">{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event details..."
            rows="4"
            className="w-full rounded-xl p-4 transition-all font-outfit resize-none force-dark-input"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 text-[#442D1C] rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 mt-4 relative overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)' }}
        >
          <span className="relative z-10">Create Event</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </form>
    </div>
  )
}
