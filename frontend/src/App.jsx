import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Members from './pages/Members'
import MemberDetails from './pages/MemberDetails'
import Committees from './pages/Committees'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Announcements from './pages/Announcements'
import Locations from './pages/Locations'
import ClubDetails from './pages/ClubDetails'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Hamburger Button - Visible only on mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-24 left-4 z-[90] p-2 bg-white/80 backdrop-blur rounded-lg shadow-md hover:bg-white transition-all text-gray-800 md:hidden"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar - Mobile Only */}
      <div className="md:hidden">
        <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Wrapper */}
      <div className="min-h-screen flex flex-col relative">
        {/* Dark Gradient from Navbar */}
        {/* Top Shield - Hides content scrolling behind/above floating navbar */}
        <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-[#84592B] via-[#84592B] via-[#84592B]/80 via-[#84592B]/40 to-transparent pointer-events-none z-[45]" />
        
        {/* Navbar - Always visible (handles desktop nav, mobile logo) */}
        <Navbar />

        {/* Page Content - Added top padding for fixed navbar */}
        <main className={`flex-1 overflow-y-auto w-full pt-32 ${isHome ? '' : 'px-6 pb-6 max-w-7xl mx-auto'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetails />} />
              <Route path="/committees" element={<Committees view="committee" />} />
              <Route path="/miniclubs" element={<Committees view="club" />} />
              <Route path="/clubs/:id" element={<ClubDetails />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/create" element={<CreateEvent />} />

              <Route path="/payments" element={<Payments />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/locations" element={<Locations />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
