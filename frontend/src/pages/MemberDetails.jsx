import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { membersAPI } from '../services/membershipAPI'
import { useAuth } from '../hooks/useAuth'

export default function MemberDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await membersAPI.get(id)
        setMember(data.member || data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!member) return <div>Not found</div>

  return (
    <div className="fade-in">
      <div className="bg-[#442D1C] p-8 rounded-3xl shadow-2xl max-w-2xl border border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-3xl font-thin font-outfit mb-2 text-white tracking-wide">{member.name}</h2>
            <p className="text-sm text-white/60 italic font-light">{member.email}</p>
          </div>
        </div>
        <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
          <div className="flex items-center">
            <span className="font-semibold text-white/80 w-24 tracking-widest uppercase text-xs">Phone:</span>
            <span className="text-white/60">{member.phone || '-'}</span>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center">
              <span className="font-semibold text-white/80 w-24 tracking-widest uppercase text-xs">Address:</span>
              <span className="text-white/60">{member.address || '-'}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="font-semibold text-white/80 w-24 tracking-widest uppercase text-xs">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${member.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              member.status === 'inactive' ? 'bg-white/10 text-white/60 border border-white/10' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
              {member.status || 'active'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-white/80 w-24 tracking-widest uppercase text-xs">Joined:</span>
            <span className="text-white/60">
              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
            </span>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center">
              <span className="font-semibold text-white/80 w-24 tracking-widest uppercase text-xs">Fees Due:</span>
              <span className={`font-bold ${member.feesDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                ₹{member.feesDue || 0}
              </span>
            </div>
          )}
          <div className="flex items-start pt-2">
            <span className="font-semibold text-white/80 w-24 mt-1 tracking-widest uppercase text-xs">Clubs:</span>
            <div className="flex-1">
              {member.committees && member.committees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {member.committees.map(c => (
                    <span key={c._id || c} className="bg-[#84592B]/30 text-[#E6D5B3] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[#84592B]/50">
                      {c.name || 'Unknown Club'}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-white/40 italic font-light text-sm">No club memberships</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
