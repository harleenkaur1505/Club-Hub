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

const clubBackgrounds = {
  'Cozy and Lifestyle Club': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000', // Warm interior
  'Academic Club': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000', // Library
  'Creative and Fun Club': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000', // Art
  'Social and Community Club': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000', // Friends
  'Tech and Skill Club': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000', // Coding
  'Mental Health Awareness Club': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000' // Yoga/Nature
}

export default function Home() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClubs()
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up')
          observer.unobserve(entry.target) // Only animate once
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    // Observe elements with 'scroll-animate' class
    setTimeout(() => {
      document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el))
    }, 100) // Small delay to ensure DOM is ready

    return () => observer.disconnect()
  }, [clubs]) // Re-run when clubs load to attach observers to new elements

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
    <div className="fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="text-center mb-16 px-4">
          <h1 className="text-6xl md:text-7xl font-thin font-outfit mb-8 text-[#442D1C] tracking-[0.2em] leading-tight drop-shadow-sm py-6">
            Welcome to <span className="font-normal text-[#442D1C]">the Club</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-8 leading-relaxed max-w-3xl mx-auto font-medium text-[#442D1C]">
            Manage members, collect dues, plan events and coordinate committees easily with our cozy platform.
          </p>
        </div>

        <div className="mb-24">
          <h1 className="text-5xl md:text-6xl font-thin font-outfit text-center mb-12 text-[#442D1C] tracking-[0.2em] drop-shadow-sm">Clubs</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {miniClubs.map((club, index) => {
              const clubData = clubs.find(c => c.name === club.name)
              const memberCount = clubData?.members?.length || 0

              return (
                <div
                  key={club.name}
                  className="group relative overflow-hidden rounded-3xl bg-[#442D1C] shadow-[0_15px_35px_rgba(68,45,28,0.5)] transition-all duration-500 h-72 flex flex-col scroll-animate opacity-0 translate-y-8 hover:scale-105"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Background Image with Brown Tint */}
                  <div
                    className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-multiply"
                    style={{
                      backgroundImage: `url(${clubBackgrounds[club.name] || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#442D1C]/90 via-[#442D1C]/60 to-transparent group-hover:from-[#442D1C]/95 transition-all duration-500" />

                  {/* Content Container */}
                  <div className="relative z-20 flex flex-col h-full p-8 text-white text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg backdrop-blur-md bg-white/20 border border-white/30 group-hover:scale-110 transition-transform duration-300`}>
                      {club.icon}
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-white drop-shadow-md group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">{club.name}</h3>
                    <p className="text-white text-sm mb-auto line-clamp-3 leading-relaxed font-medium drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">{club.description}</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <span className="text-xs font-semibold text-gray-100 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h1 className="text-5xl md:text-6xl font-thin font-outfit text-center mb-12 text-[#442D1C] tracking-[0.2em] drop-shadow-sm">System Features</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Member Management',
                icon: '👥',
                description: 'Easily track and manage all your club members',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1000' // Team working by Brooke Cagle
              },
              {
                title: 'Event Planning',
                icon: '📅',
                description: 'Plan and organize events seamlessly',
                image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000' // Calendar/Planning
              },
              {
                title: 'Committee Coordination',
                icon: '💼',
                description: 'Streamline committee workflows',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000' // Team collaboration
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-3xl bg-[#442D1C] shadow-[0_15px_35px_rgba(68,45,28,0.5)] text-center scroll-animate opacity-0 translate-y-8 group hover:scale-105 transition-all duration-500 h-[300px] flex flex-col justify-center p-8"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Image with Brown Tint */}
                <div
                  className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-multiply"
                  style={{
                    backgroundImage: `url(${feature.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#442D1C]/90 via-[#442D1C]/60 to-transparent group-hover:from-[#442D1C]/95 transition-all duration-500" />

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-white tracking-tight drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white text-base font-medium max-w-[90%] mx-auto leading-relaxed drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
