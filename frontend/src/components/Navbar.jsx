import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 pointer-events-none">
      <nav className={`
        pointer-events-auto
        flex items-center justify-between
        px-8 py-3
        bg-[#442D1C] 
        rounded-full 
        shadow-[0_10px_40px_rgba(0,0,0,0.4)]
        hover:shadow-[0_15px_50px_rgba(0,0,0,0.5)]
        backdrop-blur-xl
        transition-all duration-500 ease-in-out
        ${scrolled ? 'w-[90%] lg:w-[85%] mt-0' : 'w-[95%] mt-2'}
        bg-opacity-95
        border border-white/5
        max-w-7xl
      `}>

        {/* Left: Logo */}
        <div
          className="flex-shrink-0 flex items-center gap-4 cursor-pointer group pr-6 border-r border-[#5D3E26]/30"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5D3E26] to-[#442D1C] flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(68,45,28,0.5)] group-hover:shadow-[0_0_30px_rgba(68,45,28,0.7)] transition-all duration-300">
              CH
            </div>
          </div>
          <span className="text-white font-bold text-2xl tracking-widest group-hover:text-gray-200 transition-colors hidden sm:block">
            ClubHub
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4 min-w-0">
          {[
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Members', path: '/members' },
            { name: 'Clubs', path: '/miniclubs' },
            { name: 'Events', path: '/events' },
            { name: 'Payments', path: '/payments' },
            { name: 'Announcements', path: '/announcements' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                px-4 py-2 text-sm font-medium transition-all duration-300
                hover:scale-110 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]
                ${isActive(item.path)
                  ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-300'}
              `}
            >
              {item.name}
            </Link>
          ))}

          {/* Dropdown or More for secondary links could go here, for now putting them inline but maybe squished */}
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          {[
            { name: 'Committees', path: '/committees' },
            { name: 'Locations', path: '/locations' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                px-4 py-2 text-sm font-medium transition-all duration-300
                hover:scale-110 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]
                ${isActive(item.path)
                  ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-300'}
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right: User Profile / Auth */}
        <div className="flex-shrink-0 flex items-center gap-4 pl-6 border-l border-[#5D3E26]/30">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role || 'Member'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5D3E26] to-[#442D1C] border border-white/10 flex items-center justify-center text-white shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-full transition-all"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-bold bg-[#84592B] text-[#442D1C] px-5 py-2 rounded-full hover:bg-[#A67C52] shadow-[0_0_15px_rgba(68,45,28,0.3)] hover:shadow-[0_0_20px_rgba(68,45,28,0.5)] transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
