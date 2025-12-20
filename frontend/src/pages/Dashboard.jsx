import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { membersAPI, eventsAPI, committeesAPI } from '../services/membershipAPI'

const MINI_CLUBS = [
  'Cozy and Lifestyle Club',
  'Academic Club',
  'Creative and Fun Club',
  'Social and Community Club',
  'Tech and Skill Club',
  'Mental Health Awareness Club'
]

import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    committees: 0,
    clubs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [membersRes, eventsRes, committeesRes] = await Promise.all([
        membersAPI.list({ limit: 1 }),
        eventsAPI.list({ upcoming: true }),
        committeesAPI.list()
      ])

      // Separate clubs from committees
      const allCommittees = committeesRes.data.committees || []
      const miniClubs = allCommittees.filter(c => {
        if (!c || !c.name) return false
        const nameLower = c.name.trim().toLowerCase()
        return MINI_CLUBS.some(club => club.trim().toLowerCase() === nameLower)
      })
      const otherCommittees = allCommittees.filter(c => {
        if (!c || !c.name) return false
        const nameLower = c.name.trim().toLowerCase()
        return !MINI_CLUBS.some(club => club.trim().toLowerCase() === nameLower)
      })

      setStats({
        members: membersRes.data.total || 0,
        events: eventsRes.data.events?.length || 0,
        committees: otherCommittees.length || 0,
        clubs: miniClubs.length || 0
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const metrics = [
    { id: 1, label: 'Total Members', value: stats.members, icon: '👥', gradient: 'linear-gradient(135deg, #442D1C 0%, #362416 100%)', link: '/members' },
    { id: 2, label: 'Active Events', value: stats.events, icon: '📅', gradient: 'linear-gradient(135deg, #8B4513 0%, #6B4423 100%)', link: '/events' },
    { id: 3, label: 'Committees', value: stats.committees, icon: '💼', gradient: 'linear-gradient(135deg, #C9A961 0%, #A0522D 100%)', link: '/committees' },
    { id: 4, label: 'Clubs', value: stats.clubs, icon: '🏢', gradient: 'linear-gradient(135deg, #5D3E26 0%, #442D1C 100%)', link: '/miniclubs' }
  ]

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>

  return (
    <div className="fade-in">
      <div className="mb-12 py-6">
        <h1 className="text-6xl md:text-7xl font-thin font-outfit text-[#442D1C] tracking-[0.05em] drop-shadow-sm mb-4">
          Welcome, {user?.name || 'Member'}
        </h1>
        <p className="text-xl md:text-2xl text-[#442D1C]/70 italic font-light tracking-wide">
          Here are some insights
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, index) => (
          <Link
            key={m.id}
            to={m.link}
            className="group p-6 bg-[#442D1C] rounded-2xl shadow-[0_10px_30px_rgba(68,45,28,0.3)] slide-in-up relative overflow-hidden hover:shadow-[0_15px_45px_rgba(68,45,28,0.5)] transition-all duration-500 transform hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Opaque Brown Background with Hint of Brand Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-10 group-hover:opacity-20 transition-opacity" />

            <div className="flex items-center justify-between relative z-10">
              <div className="text-4xl p-4 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-500" style={{ background: m.gradient }}>
                {m.icon}
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70 font-medium mb-1 tracking-wider uppercase group-hover:text-white transition-colors">{m.label}</div>
                <div className="text-5xl font-thin text-white font-outfit drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-500">{m.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {user?.role === 'admin' && (
        <div className="bg-[#442D1C] p-10 rounded-3xl shadow-2xl slide-in-up mt-12 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          
          <h3 className="font-thin text-4xl mb-8 text-white font-outfit tracking-widest uppercase">Quick Actions</h3>
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link
              to="/members"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105"
            >
              View Members
            </Link>
            <Link
              to="/events/create"
              className="px-8 py-4 text-[#442D1C] bg-[#84592B] rounded-xl font-bold shadow-lg hover:bg-[#A67C52] hover:shadow-[0_0_25px_rgba(132,89,43,0.5)] transition-all transform hover:scale-105"
            >
              New Event
            </Link>
            <Link
              to="/committees"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105"
            >
              Manage Committees
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
