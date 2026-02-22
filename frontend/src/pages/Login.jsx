import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#442D1C] p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/10 slide-in-up relative overflow-hidden">
        {/* Decorative background gradients like Navbar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5D3E26] via-[#C9A961] to-[#5D3E26] opacity-50"></div>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3 text-white font-outfit">Welcome Back</h2>
          <p className="text-orange-100/70 text-lg font-light">Sign in to your account</p>
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
            <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="Enter your email"
                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-orange-200/80 mb-2 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="login-input w-full bg-[#5D3E26]/40 border border-[#84592B]/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all placeholder:text-white/60 hover:bg-[#5D3E26]/60 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C9A961]/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-200/70 hover:text-[#C9A961] hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full text-[#442D1C] p-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 mt-2 relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)'
            }}
          >
            <span className="relative z-10">Login to Dashboard</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-orange-200/60 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E6D08E] hover:text-white font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
