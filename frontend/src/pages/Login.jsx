import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useUser } from '../context/UserContext'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
    const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm()
    const { login } = useUser()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const onSubmit = async (data) => {
        try {
            setServerError('')
            await login(data.email, data.password)
            navigate('/')
        } catch (err) {
            setServerError(err.response?.data?.detail || err.response?.data?.error || 'Login failed. Please try again.')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container auth-container"
        >
            <div className="auth-card brutal-card">
                <h1 className="auth-title">Welcome Back</h1>
                <div className="section-line"></div>
                <p className="auth-subtitle">Sign in to your sanctuary</p>

                {serverError && (
                    <div className="auth-error brutal-card" style={{ borderColor: 'var(--accent-color)', background: 'rgba(255, 51, 102, 0.08)' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            {...formRegister('email', {
                                required: 'Email is required',
                                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                            })}
                            className="brutal-input"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                        {errors.email && <span className="error-msg">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...formRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                            className="brutal-input"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="error-msg">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in…' : 'Enter The Sanctuary'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </motion.div>
    )
}
