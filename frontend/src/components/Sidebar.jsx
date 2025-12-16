import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar w-64 p-4 min-h-screen hidden md:block">
      <nav className="space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          📊 Dashboard
        </NavLink>
        <NavLink
          to="/members"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          👥 Members
        </NavLink>
        <NavLink
          to="/committees"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          💼 Committees
        </NavLink>
        <NavLink
          to="/miniclubs"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          🏸 Clubs
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          📅 Events
        </NavLink>
        <NavLink
          to="/locations"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          📍 Locations
        </NavLink>
        <NavLink
          to="/payments"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          💰 Dues & Payments
        </NavLink>
        <NavLink
          to="/announcements"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          📢 Communications
        </NavLink>
      </nav>
    </aside>
  )
}
