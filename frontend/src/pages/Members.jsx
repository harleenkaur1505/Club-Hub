import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMembers } from '../redux/memberSlice'
import { membersAPI, committeesAPI } from '../services/membershipAPI'
import MemberCard from '../components/MemberCard'

// Club data matching the home page
const MINI_CLUBS_DATA = [
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

const MINI_CLUBS = MINI_CLUBS_DATA.map(club => club.name)

const clubIcons = MINI_CLUBS_DATA.reduce((acc, club) => {
  acc[club.name] = club.icon
  return acc
}, {})

const clubColors = MINI_CLUBS_DATA.reduce((acc, club) => {
  acc[club.name] = club.color
  return acc
}, {})

const clubDescriptions = MINI_CLUBS_DATA.reduce((acc, club) => {
  acc[club.name] = club.description
  return acc
}, {})

// Convert Tailwind gradient classes to actual CSS gradients
const getGradientFromTailwind = (tailwindClass) => {
  const gradientMap = {
    'from-amber-500 to-amber-600': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'from-pink-500 to-purple-600': 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
    'from-green-500 to-teal-600': 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    'from-purple-500 to-pink-600': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    'from-blue-500 to-indigo-600': 'linear-gradient(135deg, #800020 0%, #A0002A 100%)', // Maroon fallback
    'from-cyan-500 to-blue-600': 'linear-gradient(135deg, #800020 0%, #A0002A 100%)', // Maroon fallback
  }
  return gradientMap[tailwindClass] || 'linear-gradient(135deg, #800020 0%, #A0002A 100%)'
}

export default function Members() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector((state) => state.members)
  const [showForm, setShowForm] = useState(false)
  const [committees, setCommittees] = useState([])
  const [selectedClubs, setSelectedClubs] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  })
  const [error, setError] = useState(null)
  const [clubError, setClubError] = useState(null)
  const [creatingClubs, setCreatingClubs] = useState(false)

  useEffect(() => {
    dispatch(fetchMembers())
    loadCommittees()
  }, [dispatch])

  const loadCommittees = async () => {
    try {
      const { data } = await committeesAPI.list()
      const allCommittees = data.committees || []
      
      // Filter only mini clubs - case-insensitive comparison
      const miniClubsList = allCommittees.filter(c => {
        if (!c || !c.name) return false
        const committeeName = c.name.trim().toLowerCase()
        return MINI_CLUBS.some(miniClub => miniClub.trim().toLowerCase() === committeeName)
      })
      
      // If no mini clubs found, show all available committees as fallback
      // This allows users to select from any available clubs
      if (miniClubsList.length === 0 && allCommittees.length > 0) {
        setCommittees(allCommittees)
      } else {
        setCommittees(miniClubsList)
      }
    } catch (err) {
      console.error('Error loading committees:', err)
      setCommittees([]) // Set empty array on error to prevent showing stale data
    }
  }

  const createMissingClubs = async () => {
    setCreatingClubs(true)
    setClubError(null)
    try {
      // Get all existing committees
      const { data } = await committeesAPI.list()
      const existingCommittees = (data.committees || []).map(c => c.name.trim().toLowerCase())
      
      // Create missing clubs
      const clubsToCreate = MINI_CLUBS_DATA.filter(club => {
        const clubNameLower = club.name.trim().toLowerCase()
        return !existingCommittees.includes(clubNameLower)
      })
      
      if (clubsToCreate.length === 0) {
        setClubError('All mini clubs already exist! Refreshing...')
        await loadCommittees()
        setCreatingClubs(false)
        return
      }
      
      // Create all missing clubs
      const createPromises = clubsToCreate.map(club => 
        committeesAPI.create({
          name: club.name,
          description: club.description
        })
      )
      
      await Promise.all(createPromises)
      
      // Reload committees
      await loadCommittees()
      setClubError(null)
    } catch (err) {
      setClubError(err.response?.data?.message || 'Failed to create clubs. Please try again or create them manually.')
      console.error('Error creating clubs:', err)
    } finally {
      setCreatingClubs(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      // Create the member first
      const { data } = await membersAPI.create(formData)
      const newMemberId = data.member._id

      // Add member to selected clubs
      if (selectedClubs.length > 0) {
        const addToClubPromises = selectedClubs.map(clubId => 
          committeesAPI.addMember(clubId, newMemberId)
        )
        await Promise.all(addToClubPromises)
      }

      setShowForm(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
      })
      setSelectedClubs([])
      dispatch(fetchMembers()) // Refresh the list
      loadCommittees() // Refresh committees to update member counts
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create member')
      console.error('Error creating member:', err)
    }
  }

  const handleClubToggle = (clubId) => {
    setSelectedClubs(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId)
      } else {
        return [...prev, clubId]
      }
    })
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    })
    setSelectedClubs([])
    setError(null)
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">Members</h2>
        <button
          onClick={() => showForm ? handleFormCancel() : setShowForm(true)}
          className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 slide-in-up">
          <h3 className="text-xl font-semibold mb-4">Add New Member</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="2"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Street address"
              />
            </div>

            {/* Mini Clubs Selection - Matching Home Page Clubs */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Select Mini Clubs from Home Page (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-4 italic">
                Choose from the clubs featured on the home page
              </p>
              {committees.length === 0 ? (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    No mini clubs available. The clubs from the home page need to be created first.
                  </p>
                  <p className="text-xs text-yellow-700 mb-3">
                    Click the button below to automatically create all mini clubs shown on the home page, or go to Clubs & Committees page to create them manually.
                  </p>
                  {clubError && (
                    <div className={`mb-3 p-2 border rounded text-xs ${
                      clubError.includes('already exist') 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {clubError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={createMissingClubs}
                    disabled={creatingClubs}
                    className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
                  >
                    {creatingClubs ? 'Creating Clubs...' : 'Create Mini Clubs Automatically'}
                  </button>
                </div>
              ) : (
                <div className="club-grid" style={{ padding: '20px', background: 'rgba(245, 245, 220, 0.3)', borderRadius: '16px', border: '1px solid rgba(128, 0, 32, 0.1)' }}>
                  {committees.map((club) => {
                    const isSelected = selectedClubs.includes(club._id)
                    const clubColor = clubColors[club.name] || 'from-amber-500 to-amber-600'
                    const clubIcon = clubIcons[club.name] || '🏢'
                    const clubDescription = clubDescriptions[club.name] || ''
                    
                    return (
                      <label
                        key={club._id}
                        className={`card-club ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleClubToggle(club._id)}
                          className="sr-only"
                        />
                        <div className="card-club-header">
                          <div className="card-club-icon-wrapper" style={{ background: getGradientFromTailwind(clubColor) }}>
                            {clubIcon}
                          </div>
                          <h3 className="card-club-title">{club.name}</h3>
                          <div className="card-club-checkbox"></div>
                        </div>
                        {clubDescription && (
                          <p className="card-club-description">{clubDescription}</p>
                        )}
                        <div className="card-club-footer">
                          <div className="card-club-members">
                            <span className="card-club-members-icon">👥</span>
                            <span>{club.members?.length || 0} {club.members?.length === 1 ? 'member' : 'members'}</span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {selectedClubs.length > 0 && (
                <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(139, 69, 19, 0.1)', borderLeft: '4px solid #8B4513' }}>
                  <p className="text-sm font-medium" style={{ color: '#8B4513' }}>
                    ✓ {selectedClubs.length} club{selectedClubs.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
            >
              Create Member
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading members...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500 text-lg mb-4">No members found. Add your first member to get started!</p>
        </div>
      ) : (
        <div className="member-list">
          {list.map((m) => <MemberCard key={m._id} member={m} />)}
        </div>
      )}
    </div>
  )
}
