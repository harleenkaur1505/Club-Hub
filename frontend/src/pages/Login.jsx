import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl slide-in-up">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 gradient-text">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      {error && <div className="text-red-600 mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            type="email"
            placeholder="Enter your email"
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Enter your password"
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
          />
        </div>
        <button 
          type="submit" 
          className="w-full text-white p-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] mt-6"
          style={{ background: 'linear-gradient(135deg, #800020 0%, #A0002A 50%, #C9A961 100%)' }}
        >
          Login
        </button>
      </form>
    </div>
  )
}
