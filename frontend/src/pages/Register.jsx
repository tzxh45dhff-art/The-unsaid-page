import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useUser } from '../context/UserContext'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Register() {
    const { register: formRegister, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm()
    const { register: signUp } = useUser()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const onSubmit = async (data) => {
        try {
            setServerError('')
            await signUp({
                email: data.email,
                username: data.username,
                password: data.password,
                display_name: data.displayName || data.username,
            })
            navigate('/')
        } catch (err) {
            setServerError(err.response?.data?.detail || err.response?.data?.error || 'Registration failed. Please try again.')
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
                <h1 className="auth-title">Join The Sanctuary</h1>
                <div className="section-line"></div>
                <p className="auth-subtitle">Create your space for the unsaid</p>

                {serverError && (
                    <div className="auth-error brutal-card" style={{ borderColor: 'var(--accent-color)', background: 'rgba(255, 51, 102, 0.08)' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="username">Pen Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="username"
                                {...formRegister('username', {
                                    required: 'Pen name is required',
                                    minLength: { value: 3, message: 'Min 3 characters' },
                                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, and underscores only' }
                                })}
                                className="brutal-input"
                                placeholder="midnight_poet"
                                autoComplete="username"
                            />
                            {errors.username && <span className="error-msg">{errors.username.message}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                {...formRegister('displayName')}
                                className="brutal-input"
                                placeholder="The Midnight Poet"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email <span className="required">*</span></label>
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

                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="password">Password <span className="required">*</span></label>
                            <input
                                type="password"
                                id="password"
                                {...formRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                className="brutal-input"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {errors.password && <span className="error-msg">{errors.password.message}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...formRegister('confirmPassword', {
                                    required: 'Confirm your password',
                                    validate: (val) => val === watch('password') || 'Passwords do not match'
                                })}
                                className="brutal-input"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Enter The Void'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </motion.div>
    )
}
