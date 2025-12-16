import React, { useEffect, useState } from 'react'
import { committeesAPI, membersAPI } from '../services/membershipAPI'

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
    try {
      const { data } = await committeesAPI.list()
      const existingCommittees = (data.committees || []).map(c => c.name.trim().toLowerCase())

      const committeesToCreate = DEFAULT_COMMITTEES.filter(committee => {
        const committeeNameLower = committee.name.trim().toLowerCase()
        return !existingCommittees.includes(committeeNameLower)
      })

      if (committeesToCreate.length > 0) {
        const createPromises = committeesToCreate.map(committee =>
          committeesAPI.create({
            name: committee.name,
            description: committee.description
          })
        )

        await Promise.all(createPromises)
        await loadCommittees() // Refresh the list
      }
      setDefaultCommitteesCreated(true)
    } catch (err) {
      console.error('Error creating default committees:', err)
      setDefaultCommitteesCreated(true) // Set to true even on error to prevent retries
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold gradient-text">
          {view === 'club' ? 'Clubs' : view === 'committee' ? 'Committees' : 'Clubs & Committees'}
        </h2>
        <div className="flex gap-3">
          {view !== 'club' && (
            <button
              onClick={() => {
                setFormType(view === 'club' ? 'club' : 'committee')
                setShowForm(!showForm)
                setError(null)
              }}
              className="px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
            >
              {showForm && formType === 'committee' ? 'Cancel' : '+ Add Committee'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 slide-in-up border-l-4" style={{ borderLeftColor: '#800020' }}>
          <h3 className="text-xl font-semibold mb-4">
            {formType === 'committee' ? 'Add New Committee' : 'Add New Club'}
          </h3>
          {formType === 'committee' && (
            <p className="text-sm text-gray-600 mb-4 italic">
              Create organizational committees like Finance Committee, Events Committee, etc.
            </p>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {formType === 'committee' ? 'Committee Name *' : 'Club Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder={formType === 'committee' ? 'e.g., Finance Committee, Events Committee' : 'e.g., Sports Club'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder={formType === 'committee'
                  ? 'Describe the purpose and responsibilities of this committee...'
                  : 'Describe the purpose and activities of this club...'}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
              >
                Create {formType === 'committee' ? 'Committee' : 'Club'}
              </button>
              <button
                type="button"
                onClick={handleFormCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading clubs and committees...</div>
      ) : (
        <>
          {/* Mini Clubs Section */}
          {(view === 'all' || view === 'club') && miniClubs.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-800">Mini Clubs</h3>
                  <p className="text-sm text-gray-600">
                    These are the featured clubs shown on the home page. Members can join these clubs when adding a new member.
                  </p>
                </div>
              </div>
              <div className="club-grid">
                {miniClubs.map((committee) => (
                  <div
                    key={committee._id}
                    className="card-club"
                  >
                    <div className="card-club-header">
                      <div className="card-club-icon-wrapper" style={{
                        background: clubColors[committee.name]
                          ? (clubColors[committee.name].includes('from-amber')
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : clubColors[committee.name].includes('from-pink')
                              ? 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)'
                              : clubColors[committee.name].includes('from-green')
                                ? 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)'
                                : clubColors[committee.name].includes('from-purple')
                                  ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                                  : 'linear-gradient(135deg, #800020 0%, #A0002A 100%)')
                          : 'linear-gradient(135deg, #800020 0%, #A0002A 100%)'
                      }}>
                        {clubIcons[committee.name] || '🏢'}
                      </div>
                      <h3 className="card-club-title">{committee.name}</h3>
                    </div>
                    {committee.description && (
                      <p className="card-club-description">{committee.description}</p>
                    )}
                    <div className="card-club-footer">
                      <div className="card-club-members">
                        <span className="card-club-members-icon">👥</span>
                        <span>{committee.members?.length || 0} {committee.members?.length === 1 ? 'member' : 'members'}</span>
                      </div>
                    </div>
                    <div className="card-committee-actions" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}>
                      <button
                        onClick={() => handleOpenMemberModal(committee)}
                        className="card-committee-action-btn card-committee-manage-btn"
                        style={{ flex: 1 }}
                      >
                        Register as a Member
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider between sections */}
          {(view === 'all') && (miniClubs.length > 0 && otherCommittees.length > 0) && (
            <div className="my-12">
              <div className="h-px bg-gradient-to-r from-transparent via-maroon-300 to-transparent" style={{ background: 'linear-gradient(to right, transparent, rgba(128, 0, 32, 0.3), transparent)' }}></div>
            </div>
          )}

          {/* Committees Section */}
          {(view === 'all' || view === 'committee') && otherCommittees.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-800">Committees</h3>
                  <p className="text-sm text-gray-600">
                    Organizational committees for managing specific functions (Finance, Events, etc.)
                  </p>
                </div>
              </div>
              <div className="committee-grid">
                {otherCommittees.map((committee) => (
                  <div key={committee._id} className="card-committee">
                    <div className="card-committee-header">
                      <div className="card-committee-icon-wrapper">
                        {committeeIcons[committee.name] || '💼'}
                      </div>
                      <h3 className="card-committee-title">{committee.name}</h3>
                    </div>
                    {committee.description && (
                      <p className="card-committee-description">{committee.description}</p>
                    )}
                    <div className="card-committee-footer">
                      <div className="card-committee-members">
                        <span className="card-committee-members-icon">👥</span>
                        <span>{committee.members?.length || 0} {committee.members?.length === 1 ? 'member' : 'members'}</span>
                      </div>
                    </div>
                    <div className="card-committee-actions" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(128, 0, 32, 0.1)' }}>
                      <button
                        onClick={() => handleOpenMemberModal(committee)}
                        className="card-committee-action-btn card-committee-manage-btn"
                        style={{ flex: 1 }}
                      >
                        Register as a Member
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State Messages */}
          {((view === 'club' && miniClubs.length === 0) ||
            (view === 'committee' && otherCommittees.length === 0) ||
            (view === 'all' && miniClubs.length === 0 && otherCommittees.length === 0)) && (
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
      )}

      {/* Member Registration Modal */}
      {showMemberModal && selectedCommittee && (
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
                      style={{ '--tw-ring-color': 'rgba(128, 0, 32, 0.2)' }}
                      onFocus={(e) => { e.target.style.borderColor = '#800020'; e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)'; }}
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
                      style={{ '--tw-ring-color': 'rgba(128, 0, 32, 0.2)' }}
                      onFocus={(e) => { e.target.style.borderColor = '#800020'; e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)'; }}
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
                      style={{ '--tw-ring-color': 'rgba(128, 0, 32, 0.2)' }}
                      onFocus={(e) => { e.target.style.borderColor = '#800020'; e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)'; }}
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
                      style={{ '--tw-ring-color': 'rgba(128, 0, 32, 0.2)' }}
                      onFocus={(e) => { e.target.style.borderColor = '#800020'; e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)'; }}
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
                    style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
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
      )}
    </div>
  )
}
