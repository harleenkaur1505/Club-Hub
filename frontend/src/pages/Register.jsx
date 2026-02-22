import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit phone number.")
      return
    }
    try {
      const res = await register({ name, email, password, mobile, address })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-[#442D1C] p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/10 slide-in-up relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5D3E26] via-[#C9A961] to-[#5D3E26] opacity-50"></div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3 text-white font-outfit">Join ClubHub</h2>
          <p className="text-orange-100/70 text-lg font-light italic">Join the Cozy and Lifestyle Club community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Personal Name *</label>
            <div className="relative">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full identity"
                required
                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@vault.com"
                  required
                  className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
              </div>
            </div>

            <div className="group md:col-span-5">
              <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Contact Line *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(val)
                  }}
                  placeholder="10-digit Mobile Number"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Residential Locale *</label>
            <div className="relative">
              <textarea
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your detailed physical address"
                required
                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm resize-none"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-[#442D1C] p-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 mt-4 relative overflow-hidden group uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)'
            }}
          >
            <span className="relative z-10">Complete Profile</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-3">
          <p className="text-orange-200/60 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E6D08E] hover:text-white font-semibold transition-colors">
              Sign in
            </Link>
          </p>
          <Link to="/" className="text-xs text-orange-200/40 hover:text-orange-200/80 uppercase tracking-tighter transition-colors">
            Dismiss and return home
          </Link>
        </div>
      </div>
    </div>
  )
}
