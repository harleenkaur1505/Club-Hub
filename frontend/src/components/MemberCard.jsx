import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function MemberCard({ member }) {
  const { user } = useAuth()

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: 'rgba(139, 69, 19, 0.1)', text: '#8B4513', border: 'rgba(139, 69, 19, 0.3)' }
      case 'inactive': return { bg: 'rgba(160, 82, 45, 0.1)', text: '#A0522D', border: 'rgba(160, 82, 45, 0.3)' }
      case 'suspended': return { bg: 'rgba(68, 45, 28, 0.1)', text: '#442D1C', border: 'rgba(68, 45, 28, 0.3)' }
      default: return { bg: 'rgba(201, 169, 97, 0.1)', text: '#C9A961', border: 'rgba(201, 169, 97, 0.3)' }
    }
  }

  const statusStyle = getStatusColor(member.status || 'active')

  return (
    <div className="card-member">
      <div className="card-member-header">
        <div className="card-member-avatar-wrapper">
          <img
            src={member.avatar || '/default-avatar.png'}
            alt={member.name}
            className="card-member-avatar"
          />
          <div className="card-member-status-indicator" style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}></div>
        </div>
        <div className="card-member-info">
          <h3 className="card-member-name">{member.name}</h3>
          {member.email && (
            <p className="card-member-email">{member.email}</p>
          )}
        </div>
      </div>

      {member.phone && (
        <div className="card-member-detail">
          <span className="card-member-icon">📞</span>
          <span className="card-member-text">{member.phone}</span>
        </div>
      )}
      {user?.role === 'admin' && member.feesDue > 0 && (
        <div className="card-member-detail">
          <span className="card-member-icon">💰</span>
          <span className="card-member-text text-red-600 font-semibold">Due: ₹{member.feesDue}</span>
        </div>
      )}


      <div className="card-member-footer">
        <div className="card-member-status" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
          <span className="card-member-status-dot" style={{ backgroundColor: statusStyle.text }}></span>
          <span className="card-member-status-text">{member.status || 'active'}</span>
        </div>
        <div className="card-member-actions">
          <Link
            to={`/members/${member._id}`}
            className="card-member-action-btn card-member-view-btn"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
