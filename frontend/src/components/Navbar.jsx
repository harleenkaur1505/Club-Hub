import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar-elegant">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🎯</span>
            <span className="brand-text">Club Membership</span>
          </Link>
        </div>
        <div className="navbar-menu">
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/members" className="nav-link">Members</Link>
          {user ? (
            <>
              <div className="user-badge">
                <span className="user-icon">👤</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="nav-btn-primary"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="nav-btn-secondary"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
