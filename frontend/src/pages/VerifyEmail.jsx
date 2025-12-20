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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 fade-in text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Email Verification</h2>

                {status === 'verifying' && (
                    <div className="text-blue-600 font-semibold text-lg animate-pulse">
                        <p>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 font-bold text-lg">✅ {message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 font-bold">❌ {message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
