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

export default function Dashboard() {
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
        eventsAPI.list(),
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
    { id: 1, label: 'Total Members', value: stats.members, icon: '👥', gradient: 'linear-gradient(135deg, #800020 0%, #5C0015 100%)', link: '/members' },
    { id: 2, label: 'Active Events', value: stats.events, icon: '📅', gradient: 'linear-gradient(135deg, #8B4513 0%, #6B4423 100%)', link: '/events' },
    { id: 3, label: 'Committees', value: stats.committees, icon: '💼', gradient: 'linear-gradient(135deg, #C9A961 0%, #A0522D 100%)', link: '/committees' },
    { id: 4, label: 'Clubs', value: stats.clubs, icon: '🏢', gradient: 'linear-gradient(135deg, #A0002A 0%, #800020 100%)', link: '/miniclubs' }
  ]

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>

  return (
    <div className="fade-in">
      <h2 className="text-3xl font-semibold mb-8 gradient-text">Dashboard</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, index) => (
          <Link
            key={m.id}
            to={m.link}
            className="p-6 bg-white rounded-lg shadow-lg slide-in-up relative overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl p-3 rounded-xl shadow-md" style={{ background: m.gradient }}>
                {m.icon}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium mb-1">{m.label}</div>
                <div className="text-4xl font-bold gradient-text">{m.value}</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg slide-in-up">
        <h3 className="font-semibold text-xl mb-4 gradient-text">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/members"
            className="px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all transform hover:scale-105"
          >
            View Members
          </Link>
          <Link
            to="/events/create"
            className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
          >
            New Event
          </Link>
          <Link
            to="/committees"
            className="px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all transform hover:scale-105"
          >
            Manage Committees
          </Link>
        </div>
      </div>
    </div>
  )
}
