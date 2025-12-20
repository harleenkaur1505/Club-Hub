import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/membershipAPI'

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setMessage(null)

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const params = new URLSearchParams(location.search)
            const token = params.get('token')

            if (!token) {
                setError('Missing reset token. Please check your email link.')
                setLoading(false)
                return
            }

            await authAPI.resetPassword({
                token,
                newPassword: formData.newPassword
            })
            setMessage('Password reset successful! Redirecting to login...')
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 fade-in">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">


                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Min 8 chars, 1 special char"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
