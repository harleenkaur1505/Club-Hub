import React, { useEffect, useState } from 'react'
import { committeesAPI, membersAPI } from '../services/membershipAPI'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const MINI_CLUBS = [
  'Cozy and Lifestyle Club',
  'Academic Club',
  'Creative and Fun Club',
  'Social and Community Club',
  'Tech and Skill Club',
  'Mental Health Awareness Club'
]

const clubIcons = {
  'Cozy and Lifestyle Club': '🏡',
  'Academic Club': '📚',
  'Creative and Fun Club': '🎨',
  'Social and Community Club': '🤝',
  'Tech and Skill Club': '💻',
  'Mental Health Awareness Club': '🧠'
}

const clubColors = {
  'Cozy and Lifestyle Club': 'from-amber-500 to-amber-600',
  'Academic Club': 'from-amber-500 to-amber-600',
  'Creative and Fun Club': 'from-pink-500 to-purple-600',
  'Social and Community Club': 'from-green-500 to-teal-600',
  'Tech and Skill Club': 'from-amber-500 to-amber-600',
  'Mental Health Awareness Club': 'from-purple-500 to-pink-600'
}

const clubFees = {
  'Cozy and Lifestyle Club': 200,
  'Academic Club': 190,
  'Creative and Fun Club': 300,
  'Social and Community Club': 270,
  'Tech and Skill Club': 210,
  'Mental Health Awareness Club': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000' // Yoga/Nature
}

const clubBackgrounds = {
  'Cozy and Lifestyle Club': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000',
  'Academic Club': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000',
  'Creative and Fun Club': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000',
  'Social and Community Club': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000',
  'Tech and Skill Club': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
  'Mental Health Awareness Club': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'
}

const committeeBackgrounds = {
  'Membership Committee': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1000', // Team/People
  'Finance Committee': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000', // Finance/Calculator
  'Event Committee': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000' // Planning/Calendar
}

// Default committees to auto-create
const DEFAULT_COMMITTEES = [
  {
    name: 'Membership Committee',
    description: 'Manages member recruitment, onboarding, and membership-related activities. Handles new member applications and maintains membership records.',
    icon: '👥'
  },
  {
    name: 'Finance Committee',
    description: 'Oversees financial planning, budgeting, and financial reporting. Manages dues collection, expenses, and financial transparency.',
    icon: '💰'
  },
  {
    name: 'Event Committee',
    description: 'Plans and organizes club events, activities, and gatherings. Coordinates event logistics, venues, and participant management.',
    icon: '📅'
  }
]

// Committee icons mapping
const committeeIcons = {
  'Membership Committee': '👥',
  'Finance Committee': '💰',
  'Event Committee': '📅'
}

export default function Committees({ view = 'all' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [committees, setCommittees] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('committee') // 'club' or 'committee'
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedCommittee, setSelectedCommittee] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  })
  const [error, setError] = useState(null)
  const [memberModalError, setMemberModalError] = useState(null)
  const [defaultCommitteesCreated, setDefaultCommitteesCreated] = useState(false)
  const [isRegisteringMember, setIsRegisteringMember] = useState(false)

  useEffect(() => {
    loadCommittees()
    loadAllMembers()
  }, [])

  // Auto-create default committees if they don't exist (only once)
  useEffect(() => {
    if (!loading && committees.length >= 0 && !defaultCommitteesCreated) {
      createDefaultCommitteesIfNeeded()
    }
  }, [loading, defaultCommitteesCreated])

  const createDefaultCommitteesIfNeeded = async () => {
    if (defaultCommitteesCreated) return
    setDefaultCommitteesCreated(true)

    try {
      const { data } = await committeesAPI.list()
      const existingCommittees = data.committees || []
      const existingNames = existingCommittees.map(c => c.name.trim().toLowerCase())

      // 1. Create missing defaults
      const committeesToCreate = DEFAULT_COMMITTEES.filter(committee => {
        return !existingNames.includes(committee.name.trim().toLowerCase())
      })

      const miniClubsToCreate = MINI_CLUBS.filter(clubName => {
        return !existingNames.includes(clubName.trim().toLowerCase())
      }).map(clubName => ({
        name: clubName,
        description: 'A specialized club for members with shared interests.',
        fee: typeof clubFees[clubName] === 'number' ? clubFees[clubName] : 0
      }))

      const allToCreate = [...committeesToCreate, ...miniClubsToCreate]

      if (allToCreate.length > 0) {
        await Promise.all(allToCreate.map(c => committeesAPI.create(c)))
      }

      // 2. Update fees for existing Mini Clubs if needed
      const updates = []
      existingCommittees.forEach(c => {
        if (clubFees[c.name] && typeof clubFees[c.name] === 'number') {
          if (c.fee !== clubFees[c.name]) {
            updates.push(committeesAPI.update(c._id, { fee: clubFees[c.name] }))
          }
        }
      })

      if (updates.length > 0) {
        await Promise.all(updates)
      }

      if (allToCreate.length > 0 || updates.length > 0) {
        await loadCommittees() // Refresh
      }

    } catch (err) {
      console.error('Error creating/updating committees:', err)
    }
  }

  const loadAllMembers = async () => {
    try {
      const { data } = await membersAPI.list()
      setAllMembers(data.members || [])
    } catch (err) {
      console.error('Error loading members:', err)
    }
  }

  const loadCommittees = async () => {
    try {
      setLoading(true)
      const { data } = await committeesAPI.list()
      setCommittees(data.committees || [])
    } catch (err) {
      console.error('Error loading committees:', err)
      setError('Failed to load committees')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await committeesAPI.create(formData)
      setShowForm(false)
      setFormData({
        name: '',
        description: ''
      })
      setFormType('committee')
      loadCommittees() // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create ${formType}`)
      console.error(`Error creating ${formType}:`, err)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setFormData({
      name: '',
      description: ''
    })
    setFormType('committee')
    setError(null)
  }

  const handleOpenMemberModal = async (committee) => {
    try {
      // Fetch the latest committee data with populated members
      const { data } = await committeesAPI.get(committee._id)
      setSelectedCommittee(data.committee)
      setShowMemberModal(true)
      setMemberModalError(null)
    } catch (err) {
      console.error('Error loading committee:', err)
      setMemberModalError('Failed to load committee details')
    }
  }

  const handleCloseMemberModal = () => {
    setShowMemberModal(false)
    setSelectedCommittee(null)
    setMemberModalError(null)
    setMemberFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    })
  }

  const handleMemberRegistration = async (e) => {
    e.preventDefault()
    if (!selectedCommittee) return

    setMemberModalError(null)
    setIsRegisteringMember(true)
    try {
      // Create the member first
      const memberResponse = await membersAPI.create(memberFormData)
      const newMemberId = memberResponse.data.member._id

      // Add member to the committee
      await committeesAPI.addMember(selectedCommittee._id, newMemberId)

      // Refresh the committee data
      const committeeResponse = await committeesAPI.get(selectedCommittee._id)
      setSelectedCommittee(committeeResponse.data.committee)
      loadCommittees() // Refresh the main list
      loadAllMembers() // Refresh members list

      // Reset form
      setMemberFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
      })
      setMemberModalError(null)
    } catch (err) {
      setMemberModalError(err.response?.data?.message || 'Failed to register member')
      console.error('Error registering member:', err)
    } finally {
      setIsRegisteringMember(false)
    }
  }

  const handleAddMember = async (memberId) => {
    if (!selectedCommittee) return

    setMemberModalError(null)
    try {
      await committeesAPI.addMember(selectedCommittee._id, memberId)
      // Refresh the committee data in the modal
      const { data } = await committeesAPI.get(selectedCommittee._id)
      setSelectedCommittee(data.committee)
      loadCommittees() // Refresh the main list
      loadAllMembers() // Refresh members list
    } catch (err) {
      setMemberModalError(err.response?.data?.message || 'Failed to add member')
      console.error('Error adding member:', err)
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!selectedCommittee) return
    if (!window.confirm(`Remove "${memberName}" from "${selectedCommittee.name}"?`)) {
      return
    }

    setMemberModalError(null)
    try {
      await committeesAPI.removeMember(selectedCommittee._id, memberId)
      // Refresh the committee data in the modal
      const { data } = await committeesAPI.get(selectedCommittee._id)
      setSelectedCommittee(data.committee)
      loadCommittees() // Refresh the main list
      loadAllMembers() // Refresh members list
    } catch (err) {
      setMemberModalError(err.response?.data?.message || 'Failed to remove member')
      console.error('Error removing member:', err)
    }
  }

  // Get members not yet in the committee
  const getAvailableMembers = () => {
    if (!selectedCommittee) return []
    const committeeMemberIds = (selectedCommittee.members || []).map(m =>
      typeof m === 'object' ? m._id : m
    )
    return allMembers.filter(m => !committeeMemberIds.includes(m._id))
  }

  const isMiniClub = (name) => {
    if (!name) return false
    const nameLower = name.trim().toLowerCase()
    return MINI_CLUBS.some(club => club.trim().toLowerCase() === nameLower)
  }
  const miniClubs = committees.filter(c => isMiniClub(c.name))
  const otherCommittees = committees.filter(c => !isMiniClub(c.name))

  return (
    <div className="fade-in">
      <div className="mb-12 py-6">
        <h1 className="text-6xl md:text-7xl font-thin font-outfit text-[#442D1C] tracking-[0.05em] drop-shadow-sm mb-4">
          {view === 'club' ? 'Clubs' : view === 'committee' ? 'Committees' : 'Clubs & Committees'}
        </h1>
        <p className="text-xl md:text-2xl text-[#442D1C]/70 italic font-light tracking-wide">
          {view === 'club'
            ? 'Discover and join our featured mini-clubs'
            : view === 'committee'
              ? 'Organizational groups managing club functions'
              : 'Explore our clubs and organizational committees'}
        </p>
      </div>
      <div className="flex justify-end mb-6">
        {view !== 'club' && user?.role === 'admin' && (
          <button
            onClick={() => {
              setFormType(view === 'club' ? 'club' : 'committee')
              setShowForm(!showForm)
              setError(null)
            }}
            className={`px-8 py-4 rounded-xl font-bold font-outfit tracking-wider transition-all transform hover:scale-105 shadow-lg ${showForm && formType === 'committee' ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-[#442D1C] text-white hover:bg-[#5D3E26] hover:shadow-[0_0_20px_rgba(68,45,28,0.4)]'}`}
          >
            {showForm && formType === 'committee' ? 'Cancel' : '+ Add Committee'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#442D1C] p-10 rounded-3xl shadow-2xl mb-12 slide-in-up relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

          <h3 className="font-thin text-4xl mb-8 text-white font-outfit tracking-widest uppercase">
            {formType === 'committee' ? 'Add New Committee' : 'Add New Club'}
          </h3>
          {formType === 'committee' && (
            <p className="text-white/50 text-base mb-8 italic font-light">
              Create organizational committees like Finance Committee, Events Committee, etc.
            </p>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm backdrop-blur-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">
                {formType === 'committee' ? 'Committee Name *' : 'Club Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 focus:border-[#84592B]/50 transition-all font-outfit"
                placeholder={formType === 'committee' ? 'e.g., Finance Committee' : 'e.g., Sports Club'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-tighter">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#84592B]/50 focus:border-[#84592B]/50 transition-all font-outfit"
                placeholder={formType === 'committee'
                  ? 'Describe the purpose and responsibilities...'
                  : 'Describe the purpose and activities...'}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-[#84592B] text-[#442D1C] rounded-xl font-bold shadow-lg hover:bg-[#A67C52] hover:shadow-[0_0_20px_rgba(132,89,43,0.4)] transition-all transform hover:scale-[1.02]"
              >
                Create {formType === 'committee' ? 'Committee' : 'Club'}
              </button>
              <button
                type="button"
                onClick={handleFormCancel}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#442D1C]/50 animate-pulse font-outfit tracking-widest uppercase">Loading clubs and committees...</div>
      ) : (
        <>
          {/* Mini Clubs Section */}
          {(view === 'all' || view === 'club') && MINI_CLUBS.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  {view !== 'club' && <h3 className="text-4xl font-thin font-outfit mb-8 text-[#442D1C] tracking-widest uppercase">Clubs</h3>}


                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MINI_CLUBS.map((clubName) => {
                  const committee = committees.find(c => c.name === clubName) || {
                    _id: null,
                    name: clubName,
                    description: 'A specialized club for members with shared interests.',
                    members: []
                  }

                  return (
                    <div
                      key={clubName}
                      className="card-club group relative overflow-hidden rounded-2xl bg-[#442D1C] shadow-lg hover:shadow-2xl transition-all duration-500 h-[320px] flex flex-col"
                    >
                      {/* Background Image with Brown Tint */}
                      <div
                        className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-multiply"
                        style={{
                          backgroundImage: `url(${clubBackgrounds[committee.name] || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />

                      {/* Gradient Overlay for Readability */}
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#442D1C]/90 via-[#442D1C]/60 to-transparent group-hover:from-[#442D1C]/95 transition-all duration-500" />

                      {/* Content Container */}
                      <div className="relative z-20 flex flex-col h-full p-6 text-white">

                        {/* Header */}
                        <div
                          className="flex items-center gap-4 mb-4 cursor-pointer"
                          onClick={() => navigate(`/clubs/${committee._id}`)}
                        >
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-md bg-white/20 border border-white/30 group-hover:scale-105 transition-transform duration-300">
                            {clubIcons[committee.name] || '🏢'}
                          </div>
                          <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">
                            {committee.name}
                          </h3>
                        </div>

                        {/* Description */}
                        {committee.description && (
                          <p className="text-white text-sm line-clamp-3 mb-auto leading-relaxed font-medium drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                            {committee.description}
                          </p>
                        )}

                        {/* Footer Details */}
                        <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
                          {committee.location && (
                            <div className="flex items-center text-sm text-white font-medium group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                              <span className="mr-2 opacity-80">📍</span>
                              <span className="truncate">{committee.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-white font-medium group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                              <span className="mr-2 opacity-80">👥</span>
                              <span>{committee.members?.length || 0} Members</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/clubs/${committee._id}`);
                              }}
                              className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all"
                            >
                              View Club
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Divider between sections */}
          {(view === 'all') && (miniClubs.length > 0 && otherCommittees.length > 0) && (
            <div className="my-12">
              <div className="h-px bg-gradient-to-r from-transparent via-maroon-300 to-transparent" style={{ background: 'linear-gradient(to right, transparent, rgba(68, 45, 28, 0.3), transparent)' }}></div>
            </div>
          )}

          {/* Committees Section */}
          {(view === 'all' || view === 'committee') && otherCommittees.length > 0 && (
            <div className="mb-12">
              <div className="text-left mb-8">
                <div>
                  {view === 'all' && <h3 className="text-4xl font-thin font-outfit mb-8 text-[#442D1C] tracking-widest uppercase">Committees</h3>}

                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherCommittees.map((committee) => (
                  <div key={committee._id} className="card-club group relative overflow-hidden rounded-2xl bg-[#442D1C] shadow-lg hover:shadow-2xl transition-all duration-500 h-[320px] flex flex-col">

                    {/* Background Image with Brown Tint */}
                    <div
                      className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-multiply"
                      style={{
                        backgroundImage: `url(${committeeBackgrounds[committee.name] || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />

                    {/* Dark Gradient Overlay for Maximum Clarity */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#442D1C]/90 via-[#442D1C]/60 to-transparent group-hover:from-[#442D1C]/95 transition-all duration-500" />

                    {/* Content Container */}
                    <div className="relative z-20 flex flex-col h-full p-6 text-white">

                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4 cursor-pointer" onClick={() => navigate(`/clubs/${committee._id}`)}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-md bg-white/20 border border-white/30 group-hover:scale-105 transition-transform duration-300">
                          {committeeIcons[committee.name] || '💼'}
                        </div>
                        <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">
                          {committee.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {committee.description && (
                        <p className="text-white text-sm line-clamp-3 mb-auto leading-relaxed font-medium drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                          {committee.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-white font-medium group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">
                            <span className="mr-2 opacity-80">👥</span>
                            <span>{committee.members?.length || 0} Members</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clubs/${committee._id}`);
                            }}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all"
                          >
                            View
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State Messages */}
          {((view === 'club' && MINI_CLUBS.length === 0) ||
            (view === 'committee' && otherCommittees.length === 0) ||
            (view === 'all' && MINI_CLUBS.length === 0 && otherCommittees.length === 0)) && (
              <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                <p className="text-gray-500 text-lg mb-4">
                  {view === 'club' ? 'No mini clubs found.' :
                    view === 'committee' ? 'No committees found.' :
                      'No clubs or committees found.'}
                  Add your first one to get started!
                </p>
              </div>
            )}
        </>
      )
      }

      {/* Member Registration Modal */}
      {
        showMemberModal && selectedCommittee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Register as Member - {selectedCommittee.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fill out the form below to register as a member of this committee
                  </p>
                </div>
                <button
                  onClick={handleCloseMemberModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {memberModalError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    {memberModalError}
                  </div>
                )}

                <form onSubmit={handleMemberRegistration} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={memberFormData.name}
                        onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 transition-all"
                        style={{ '--tw-ring-color': 'rgba(68, 45, 28, 0.2)' }}
                        onFocus={(e) => { e.target.style.borderColor = '#442D1C'; e.target.style.boxShadow = '0 0 0 3px rgba(68, 45, 28, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={memberFormData.email}
                        onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 transition-all"
                        style={{ '--tw-ring-color': 'rgba(68, 45, 28, 0.2)' }}
                        onFocus={(e) => { e.target.style.borderColor = '#442D1C'; e.target.style.boxShadow = '0 0 0 3px rgba(68, 45, 28, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone</label>
                      <input
                        type="tel"
                        value={memberFormData.phone}
                        onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 transition-all"
                        style={{ '--tw-ring-color': 'rgba(68, 45, 28, 0.2)' }}
                        onFocus={(e) => { e.target.style.borderColor = '#442D1C'; e.target.style.boxShadow = '0 0 0 3px rgba(68, 45, 28, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Status</label>
                      <select
                        value={memberFormData.status}
                        onChange={(e) => setMemberFormData({ ...memberFormData, status: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 transition-all"
                        style={{ '--tw-ring-color': 'rgba(68, 45, 28, 0.2)' }}
                        onFocus={(e) => { e.target.style.borderColor = '#442D1C'; e.target.style.boxShadow = '0 0 0 3px rgba(68, 45, 28, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
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
                      value={memberFormData.address}
                      onChange={(e) => setMemberFormData({ ...memberFormData, address: e.target.value })}
                      rows="2"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isRegisteringMember}
                      className="flex-1 text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #442D1C 0%, #5D3E26 50%, #C9A961 100%)' }}
                    >
                      {isRegisteringMember ? 'Registering...' : 'Register as Member'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseMemberModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Show current member count */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Current members in this committee: <span className="font-semibold text-gray-800">{selectedCommittee.members?.length || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
