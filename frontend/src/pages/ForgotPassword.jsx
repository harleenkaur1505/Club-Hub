import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/membershipAPI'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            await authAPI.forgotPassword({ email })
            setMessage('OTP sent! Please check your email.')
            setTimeout(() => navigate('/reset-password', { state: { email } }), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#442D1C] rounded-3xl shadow-2xl p-10 fade-in relative overflow-hidden border border-white/5">
                <style>{`
                    /* High specificity selector to override global styles */
                    body div input.force-dark-input {
                        background-color: rgba(68, 45, 28, 0.6) !important;
                        color: white !important;
                        border-color: rgba(255, 255, 255, 0.1) !important;
                    }
                    body div input.force-dark-input:focus {
                        border-color: #C9A961 !important;
                        background-color: rgba(68, 45, 28, 0.8) !important;
                    }
                    .force-dark-input::placeholder {
                        color: rgba(255, 255, 255, 0.3) !important;
                    }
                    .force-dark-input:-webkit-autofill {
                        -webkit-box-shadow: 0 0 0 30px #442D1C inset !important;
                        -webkit-text-fill-color: white !important;
                    }
                `}</style>

                <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6D08E]/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A961]/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <h2 className="text-3xl font-thin text-center text-white mb-8 font-outfit tracking-widest uppercase relative z-10">Forgot Password</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl backdrop-blur-sm relative z-10">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-200 rounded-xl backdrop-blur-sm relative z-10">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-[#C9A961] mb-2 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl p-4 transition-all font-outfit force-dark-input"
                            placeholder="Enter your registered email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-[#442D1C] rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(193,161,96,0.39)] hover:shadow-[0_6px_20px_rgba(193,161,96,0.23)] hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #E6D08E 0%, #C9A961 100%)' }}
                    >
                        <span className="relative z-10">{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>

                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm text-white/60 hover:text-white hover:underline transition-colors font-light tracking-wide">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
