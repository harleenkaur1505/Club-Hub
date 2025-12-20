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
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{member.name}</h2>
            <p className="text-sm text-gray-600">{member.email}</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-24">Phone:</span>
            <span className="text-gray-600">{member.phone || '-'}</span>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-24">Address:</span>
              <span className="text-gray-600">{member.address || '-'}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-24">Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-semibold ${member.status === 'active' ? 'bg-green-100 text-green-700' :
              member.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
              {member.status || 'active'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-24">Joined:</span>
            <span className="text-gray-600">
              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
            </span>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 w-24">Fees Due:</span>
              <span className={`font-bold ${member.feesDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{member.feesDue || 0}
              </span>
            </div>
          )}
          <div className="flex items-start pt-2">
            <span className="font-semibold text-gray-700 w-24 mt-1">Clubs:</span>
            <div className="flex-1">
              {member.committees && member.committees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {member.committees.map(c => (
                    <span key={c._id || c} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium border border-blue-100">
                      {c.name || 'Unknown Club'}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">No club memberships</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
