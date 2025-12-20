import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ isOpen, close }) {
  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={close}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 pt-20 flex flex-col h-full overflow-y-auto">
          <nav className="space-y-3 flex-1">
            <NavLink
              to="/dashboard"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>📊</span> Dashboard
            </NavLink>
            <NavLink
              to="/members"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>👥</span> Members
            </NavLink>
            <NavLink
              to="/committees"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>💼</span> Committees
            </NavLink>
            <NavLink
              to="/miniclubs"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>🏸</span> Clubs
            </NavLink>
            <NavLink
              to="/events"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>📅</span> Events
            </NavLink>
            <NavLink
              to="/locations"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>📍</span> Locations
            </NavLink>
            <NavLink
              to="/payments"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>💰</span> Dues
            </NavLink>
            <NavLink
              to="/announcements"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600' : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                }`
              }
            >
              <span>📢</span> Announcements
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  )
}
