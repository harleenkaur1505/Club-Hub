import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/membershipAPI'

export default function VerifyEmail() {
    const navigate = useNavigate()
    const location = useLocation()
    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...')

    useEffect(() => {
        const verifyToken = async () => {
            const params = new URLSearchParams(location.search)
            const token = params.get('token')

            if (!token) {
                setStatus('error')
                setMessage('Invalid verification link. Missing token.')
                return
            }

            try {
                await authAPI.verifyEmail({ token })
                setStatus('success')
                setMessage('Email verified successfully! Redirecting to login...')
                setTimeout(() => navigate('/login'), 2000)
            } catch (err) {
                setStatus('error')
                setMessage(err.response?.data?.message || 'Verification failed. Link may be invalid or expired.')
            }
        }

        verifyToken()
    }, [location.search, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#442D1C] rounded-3xl shadow-2xl p-10 fade-in text-center relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6D08E]/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A961]/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <h2 className="text-3xl font-thin text-white mb-8 font-outfit tracking-widest uppercase relative z-10">Email Verification</h2>

                {status === 'verifying' && (
                    <div className="text-[#E6D08E] font-semibold text-lg animate-pulse relative z-10">
                        <p>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl relative z-10">
                        <p className="text-green-200 font-bold text-lg text-shadow-sm">✅ {message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative z-10">
                        <p className="text-red-200 font-bold">❌ {message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 px-8 py-3 bg-gradient-to-r from-[#E6D08E] to-[#C9A961] text-[#442D1C] rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
