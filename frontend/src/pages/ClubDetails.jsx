import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { committeesAPI, eventsAPI, membersAPI } from '../services/membershipAPI'
import { useAuth } from '../hooks/useAuth'
import ConfirmationModal from '../components/ConfirmationModal'
import dayjs from 'dayjs'

const clubBackgrounds = {
    'Cozy and Lifestyle Club': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000',
    'Academic Club': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000',
    'Creative and Fun Club': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000',
    'Social and Community Club': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000',
    'Tech and Skill Club': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
    'Mental Health Awareness Club': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000'
}

export default function ClubDetails() {
    const { id } = useParams()
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()

    const [club, setClub] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [registerError, setRegisterError] = useState(null)
    const [isRegistering, setIsRegistering] = useState(false)
    const [isCanceling, setIsCanceling] = useState(false)
    const [memberFormData, setMemberFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
    })

    // Custom Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        isAlert: false,
        onConfirm: () => { }
    })

    const closeCustomModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }))

    // Load data
    useEffect(() => {
        loadClubData()
    }, [id])

    // Auto-fill member form with logged-in user details
    useEffect(() => {
        if (user) {
            setMemberFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }))
        }
    }, [user])

    const loadClubData = async () => {
        if (!id || id === 'null') {
            navigate('/dashboard')
            return
        }
        try {
            setLoading(true)
            // Fetch club details
            const clubRes = await committeesAPI.get(id)
            setClub(clubRes.data.committee)

            // Fetch events for this club
            const eventsRes = await eventsAPI.list() // Ideally we should have a filter, but we filter client-side for now
            const clubEvents = (eventsRes.data.events || []).filter(e => e.committee && e.committee === id)
            setEvents(clubEvents)
        } catch (err) {
            console.error(err)
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load club details',
                isAlert: true,
                onConfirm: closeCustomModal
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = () => {
        setRegisterError(null)
        setShowRegisterModal(true)
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        setRegisterError(null)

        if (!/^\d{10}$/.test(memberFormData.phone)) {
            setRegisterError("Please enter a valid 10-digit phone number.")
            return
        }

        setIsRegistering(true)

        try {
            let memberId;

            // 1. Check if user is logged in and already has a member profile
            if (user?.email) {
                const existingRes = await membersAPI.list({ q: user.email })
                const existingMember = existingRes.data.members?.find(m => m.email.toLowerCase() === user.email.toLowerCase())

                if (existingMember) {
                    memberId = existingMember._id
                }
            }

            // 2. If no existing member found, create one (fallback or guest)
            if (!memberId) {
                const memberRes = await membersAPI.create(memberFormData)
                memberId = memberRes.data.member._id
            }

            // 3. Add to Club
            await committeesAPI.addMember(id, memberId)

            // Refresh Data
            loadClubData()
            if (refreshUser) await refreshUser()
            setShowRegisterModal(false)
            setMemberFormData({ name: '', email: '', phone: '', address: '', status: 'active' })
            setModalConfig({
                isOpen: true,
                title: 'Success',
                message: 'Member registered successfully!',
                isAlert: true,
                onConfirm: closeCustomModal
            })
        } catch (err) {
            console.error(err)
            setRegisterError(err.response?.data?.message || "Failed to register member.")
        } finally {
            setIsRegistering(false)
        }
    }

    const triggerCancelMembership = () => {
        setModalConfig({
            isOpen: true,
            title: 'Cancel Membership',
            message: 'Are you sure you want to cancel your membership to this club?',
            isAlert: false,
            onConfirm: executeCancelMembership
        })
    }

    const executeCancelMembership = async () => {
        closeCustomModal()
        setIsCanceling(true)
        try {
            await committeesAPI.cancelMembership(id)
            loadClubData()
            if (refreshUser) await refreshUser()
            setModalConfig({
                isOpen: true,
                title: 'Membership Canceled',
                message: 'Your membership has been successfully canceled.',
                isAlert: true,
                onConfirm: closeCustomModal
            })
        } catch (err) {
            console.error(err)
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: err.response?.data?.message || "Failed to cancel membership.",
                isAlert: true,
                onConfirm: closeCustomModal
            })
        } finally {
            setIsCanceling(false)
        }
    }

    if (loading) return <div className="text-center py-8">Loading club details...</div>
    if (!club) return <div className="text-center py-8">Club not found.</div>

    return (
        <div className="fade-in max-w-6xl mx-auto px-4 md:px-0">
            {/* Header Section */}
            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-10 shadow-2xl group border border-white/5">
                {/* Brown Opaque Styling */}
                <div className="absolute inset-0 z-0 bg-[#442D1C]" />
                <img
                    src={clubBackgrounds[club.name] || `https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200`}
                    alt={club.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 transition-transform duration-700 group-hover:scale-110"
                />

                {/* Signature Brown Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#442D1C] via-[#442D1C]/40 to-transparent z-10" />

                <div className="absolute bottom-0 left-0 p-8 md:p-10 z-20 text-white w-full">
                    <h1 className="text-4xl md:text-5xl font-thin font-outfit mb-4 tracking-[0.05em] text-white drop-shadow-2xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-500">
                        {club.name}
                    </h1>
                    <p className="text-lg md:text-xl opacity-70 italic font-light tracking-wide max-w-2xl mb-6">
                        {club.description || "A premium community for enthusiasts and professionals."}
                    </p>
                    {club.location && (
                        <div className="flex items-center text-white/40 tracking-[0.2em] uppercase text-[10px] font-bold">
                            <span className="mr-3 text-xl">📍</span>
                            <span>{club.location}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* Main Content - Left Column */}
                <div className="md:col-span-2 space-y-8">

                    {/* About Section */}
                    <div className="bg-[#442D1C] p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />

                        <h2 className="text-2xl font-thin font-outfit mb-4 text-white tracking-widest uppercase relative z-10">About the Club</h2>
                        <p className="text-white/60 leading-relaxed text-base italic font-light relative z-10">
                            {club.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4 relative z-10">
                            <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] block mb-1">Membership Fee</span>
                                <div className="text-xl font-thin font-outfit text-white">₹{club.fee || 0} / year</div>
                            </div>
                            <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] block mb-1">Active Members</span>
                                <div className="text-xl font-thin font-outfit text-white">{club.members?.length || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Events Gallery Section */}
                    <div>
                        <h2 className="text-2xl font-thin font-outfit mb-6 text-[#442D1C] tracking-widest uppercase">Event Gallery</h2>
                        {events.length === 0 ? (
                            <div className="bg-[#442D1C]/5 p-12 rounded-3xl border border-[#442D1C]/10 text-center">
                                <p className="text-[#442D1C]/40 italic font-light tracking-widest uppercase">No events conducted yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {events.map(event => (
                                    <div key={event._id} className="group bg-[#442D1C] rounded-3xl shadow-xl overflow-hidden flex flex-col md:row relative overflow-hidden border border-white/5 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01]">
                                        <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[#442D1C]/20 z-10 transition-opacity duration-500 group-hover:opacity-0" />
                                            <img
                                                src={event.images?.[0] || `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800`}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 bg-[#84592B] text-[#442D1C] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase z-20 shadow-lg">
                                                {dayjs(event.date).format('MMM D, YYYY')}
                                            </div>
                                        </div>
                                        <div className="p-8 md:w-2/3 flex flex-col justify-between relative z-20">
                                            <div>
                                                <h3 className="text-2xl font-thin font-outfit mb-4 text-white tracking-wide group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
                                                    {event.title}
                                                </h3>
                                                <p className="text-white/60 line-clamp-2 italic font-light text-sm mb-6 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs tracking-[0.2em] font-bold uppercase">
                                                <span className="text-white/40">📍 {event.venue || 'TBA'}</span>
                                                <span className={`${dayjs(event.date).isBefore(dayjs()) ? 'text-white/20' : 'text-[#84592B]'} drop-shadow-sm`}>
                                                    {dayjs(event.date).isBefore(dayjs()) ? 'Completed' : 'Upcoming'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">

                    {/* Action Card */}
                    <div className="bg-[#442D1C] p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#84592B] opacity-10 rounded-full blur-2xl" />

                        <h3 className="text-xl font-thin font-outfit mb-3 text-white tracking-widest uppercase">Join Us Today</h3>
                        <p className="text-white/40 mb-6 italic font-light text-xs leading-relaxed">
                            Experience the exclusivity of {club.name}. Register now to unlock community events.
                        </p>

                        {user?.joinedClubs?.includes(club._id) ? (
                            <button
                                onClick={triggerCancelMembership}
                                disabled={isCanceling}
                                className="w-full py-3.5 text-white bg-red-900/60 border border-red-500/50 rounded-xl font-bold font-outfit tracking-widest uppercase transition-all transform hover:scale-[1.02] hover:bg-red-800/80 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 text-sm disabled:opacity-50"
                            >
                                {isCanceling ? 'Canceling...' : 'Cancel Membership'}
                            </button>
                        ) : (
                            <button
                                onClick={handleRegister}
                                className="w-full py-3.5 text-[#442D1C] bg-[#84592B] rounded-xl font-bold font-outfit tracking-widest uppercase transition-all transform hover:scale-[1.02] hover:bg-[#A67C52] hover:shadow-[0_0_20px_rgba(132,89,43,0.3)] active:scale-95 text-sm"
                            >
                                Become a Member
                            </button>
                        )}
                    </div>

                    {/* Members List (Compact) */}
                    <div className="bg-[#442D1C] p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/5">
                        <h3 className="text-xs font-bold text-white/40 tracking-[0.2em] uppercase font-outfit mb-5 border-b border-white/10 pb-3">Top Members</h3>
                        <div className="space-y-5">
                            {(club.members || []).slice(0, 5).map(member => (
                                <div key={member._id} className="group flex items-center gap-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shadow-lg border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                        👤
                                    </div>
                                    <div>
                                        <div className="font-outfit text-sm text-white/80 tracking-wide group-hover:text-white transition-colors">{member.name}</div>
                                        <div className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">{member.status || 'Active'} MEMBER</div>
                                    </div>
                                </div>
                            ))}
                            {(club.members || []).length === 0 && (
                                <p className="text-white/10 italic font-light text-center py-2 text-xs">No members yet.</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4 backdrop-fade">
                    <div className="bg-[#442D1C] rounded-[40px] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] w-full max-w-xl overflow-hidden zoom-in border border-white/10 relative">
                        {/* Decorative background gradients */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5D3E26] via-[#C9A961] to-[#5D3E26] opacity-50"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A961] opacity-5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5D3E26] opacity-10 rounded-full -ml-32 -mb-32 blur-[80px] pointer-events-none" />

                        <div className="p-10 text-white relative">
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-4xl font-bold font-outfit mb-3 text-white drop-shadow-md">Join {club.name}</h3>
                                    <p className="text-orange-100/70 text-lg font-light italic italic">Become a member of this exclusive community</p>
                                </div>
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 text-white/40 hover:text-white border border-white/5"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-6 relative z-10">
                                {registerError && (
                                    <div className="bg-red-500/10 text-red-200 p-4 rounded-xl border border-red-500/20 text-sm italic font-light backdrop-blur-sm">
                                        {registerError}
                                    </div>
                                )}

                                <div className="group">
                                    <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Personal Name *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={memberFormData.name}
                                            onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                                            className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
                                            placeholder="Enter your full identity"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="group md:col-span-7">
                                        <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Digital Mail *</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={memberFormData.email}
                                                onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                                                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
                                                placeholder="email@vault.com"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                                        </div>
                                    </div>
                                    <div className="group md:col-span-5">
                                        <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Contact Line *</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                required
                                                value={memberFormData.phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setMemberFormData({ ...memberFormData, phone: val })
                                                }}
                                                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
                                                placeholder="10-digit Mobile Number"
                                                pattern="[0-9]{10}"
                                                maxLength="10"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Residential Locale *</label>
                                    <div className="relative">
                                        <textarea
                                            required
                                            rows="2"
                                            value={memberFormData.address}
                                            onChange={(e) => setMemberFormData({ ...memberFormData, address: e.target.value })}
                                            className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm resize-none"
                                            placeholder="Your detailed physical address"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterModal(false)}
                                        className="flex-1 py-4 text-white hover:text-[#C9A961] font-bold tracking-widest uppercase transition-all duration-300 hover:bg-white/5 rounded-xl border border-white/5"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isRegistering}
                                        className="flex-[2] py-4 bg-gradient-to-r from-[#C9A961] via-[#E6D5B3] to-[#C9A961] text-[#442D1C] rounded-xl font-bold font-outfit tracking-widest uppercase shadow-[0_0_20px_rgba(201,169,97,0.3)] hover:shadow-[0_0_30px_rgba(201,169,97,0.5)] transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 active:scale-95"
                                    >
                                        {isRegistering ? 'Processing...' : 'Complete Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeCustomModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isAlert={modalConfig.isAlert}
            />

        </div>
    )
}
