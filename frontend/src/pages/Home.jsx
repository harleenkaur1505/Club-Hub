import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { committeesAPI } from '../services/membershipAPI'

const miniClubs = [
  {
    name: 'Cozy and Lifestyle Club',
    icon: '🏡',
    color: 'from-amber-500 to-amber-600',
    description: 'Wellness, home decor, cooking, and creating a comfortable, balanced lifestyle.'
  },
  {
    name: 'Academic Club',
    icon: '📚',
    color: 'from-amber-500 to-amber-600',
    description: 'Intellectual growth, research, and academic excellence across various disciplines.'
  },
  {
    name: 'Creative and Fun Club',
    icon: '🎨',
    color: 'from-pink-500 to-purple-600',
    description: 'Art workshops, creative writing, music, drama, and fun creative activities.'
  },
  {
    name: 'Social and Community Club',
    icon: '🤝',
    color: 'from-green-500 to-teal-600',
    description: 'Building connections, volunteer activities, and community service projects.'
  },
  {
    name: 'Tech and Skill Club',
    icon: '💻',
    color: 'from-amber-500 to-amber-600',
    description: 'Programming, web development, digital marketing, and tech skills workshops.'
  },
  {
    name: 'Mental Health Awareness Club',
    icon: '🧠',
    color: 'from-purple-500 to-pink-600',
    description: 'Promoting mental wellness, reducing stigma, and providing support through discussions and workshops.'
  }
]

export default function Home() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const { data } = await committeesAPI.list()
      setClubs(data.committees || [])
    } catch (err) {
      console.error('Error loading clubs:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-6 gradient-text float-animation">
          Welcome to the Club Membership System
        </h1>
        <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto font-medium" style={{ color: '#800020' }}>
          Manage members, collect dues, plan events and coordinate committees easily with our cozy platform.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <Link 
          to="/register" 
          className="px-8 py-4 text-white rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)', borderColor: 'rgba(128, 0, 32, 0.3)' }}
        >
          Get Started
        </Link>
        <Link 
          to="/committees" 
          className="px-8 py-4 border-2 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          style={{ borderColor: '#800020', color: '#800020', backgroundColor: '#F5F5DC' }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#800020'; e.target.style.color = 'white'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#F5F5DC'; e.target.style.color = '#800020'; }}
        >
          Explore Clubs
        </Link>
        <Link 
          to="/events" 
          className="px-8 py-4 border-2 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          style={{ borderColor: '#800020', color: '#800020', backgroundColor: '#F5F5DC' }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#800020'; e.target.style.color = 'white'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#F5F5DC'; e.target.style.color = '#800020'; }}
        >
          View Events
        </Link>
      </div>

      {/* Mini Clubs Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">Our Mini Clubs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miniClubs.map((club, index) => {
            const clubData = clubs.find(c => c.name === club.name)
            const memberCount = clubData?.members?.length || 0
            
            return (
              <div 
                key={club.name} 
                className="p-6 bg-white rounded-lg shadow-lg slide-in-up hover:shadow-xl transition-all transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${club.color} flex items-center justify-center text-3xl mb-4 mx-auto`}>
                  {club.icon}
                </div>
                <h3 className="font-bold text-xl mb-2 text-center text-gray-800">{club.name}</h3>
                <p className="text-gray-600 text-sm mb-4 text-center">{club.description}</p>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider Section */}
      <div className="my-16 flex items-center justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-maroon-300/60 to-transparent" style={{ background: 'linear-gradient(to right, transparent, rgba(201, 169, 97, 0.5), transparent)' }}></div>
        <div className="mx-6 px-4 py-2 backdrop-blur-sm rounded-full border-2 shadow-lg" style={{ 
          background: 'rgba(128, 0, 32, 0.4)',
          borderColor: 'rgba(201, 169, 97, 0.4)',
          boxShadow: '0 4px 12px rgba(128, 0, 32, 0.2)'
        }}>
          <span className="font-semibold text-sm drop-shadow" style={{ color: '#F5F5DC' }}>Platform Features</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-maroon-300/60 to-transparent" style={{ background: 'linear-gradient(to right, transparent, rgba(201, 169, 97, 0.5), transparent)' }}></div>
      </div>

      {/* Features Section */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">System Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-lg text-center slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="font-semibold text-lg mb-2">Member Management</h3>
            <p className="text-gray-600 text-sm">Easily track and manage all your club members</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg text-center slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-semibold text-lg mb-2">Event Planning</h3>
            <p className="text-gray-600 text-sm">Plan and organize events seamlessly</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg text-center slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl mb-4">💼</div>
            <h3 className="font-semibold text-lg mb-2">Committee Coordination</h3>
            <p className="text-gray-600 text-sm">Streamline committee workflows</p>
          </div>
        </div>
      </div>
    </div>
  )
}
