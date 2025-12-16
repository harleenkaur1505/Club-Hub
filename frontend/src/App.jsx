import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Members from './pages/Members'
import MemberDetails from './pages/MemberDetails'
import Committees from './pages/Committees'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import Locations from './pages/Locations'
import Payments from './pages/Payments'
import Announcements from './pages/Announcements'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="app-wrapper">
      {/* Cottage Navbar */}
      <Navbar />

      <div className="cottage-layout">
        {/* Rustic Sidebar */}
        <Sidebar />

        {/* Paper-like content area */}
        <main className="cottage-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetails />} />
              <Route path="/committees" element={<Committees view="committee" />} />
              <Route path="/miniclubs" element={<Committees view="club" />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/create" element={<CreateEvent />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/announcements" element={<Announcements />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
