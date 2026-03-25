import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'
import { Menu, X, Sun, Moon, BookOpen, LogOut, User, Headphones } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import AmbientPlayer from './AmbientPlayer'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [ambientOpen, setAmbientOpen] = useState(false)
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const { points, user, isAuthenticated, logout } = useUser()

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Poems', path: '/poems' },
        { name: 'Stories', path: '/stories' },
        { name: 'Books', path: '/books' },
        { name: 'Collections', path: '/collections' },
        { name: 'Submit', path: '/submit' },
        { name: 'AI Writer', path: '/ai-writer' },
        { name: 'Pen Pals', path: '/penpals' },
    ]

    return (
        <header className="navbar-container">
            <div className="container navbar">
                <Link to="/" className="site-title">
                    The Unsaid Page
                </Link>

                {/* Desktop Nav */}
                <nav className="desktop-nav">
                    <ul>
                        {links.map((link) => (
                            <li key={link.name}>
                                <Link to={link.path} className={location.pathname === link.path ? 'active' : ''}>
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="nav-controls desktop-only">
                    <span className="user-points" title="Sanctuary Points">{points} pts</span>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Link to="/my-works" style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'inherit', textDecoration: 'none' }}>
                                <User size={14} style={{ marginRight: '0.25rem' }} />
                                {user?.display_name || user?.username}
                            </Link>
                            <button onClick={logout} className="theme-btn" aria-label="Logout" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Login</Link>
                            <Link to="/register" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '2px solid var(--border-color)' }}>Register</Link>
                        </div>
                    )}
                    <div className="theme-toggles">
                        <button onClick={() => setAmbientOpen(o => !o)} className={`theme-btn ${ambientOpen ? 'active' : ''}`} aria-label="Ambient Sounds" title="Ambient Sounds"><Headphones size={18} /></button>
                        <button onClick={() => toggleTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} aria-label="Light Mode"><Sun size={18} /></button>
                        <button onClick={() => toggleTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} aria-label="Dark Mode"><Moon size={18} /></button>
                        <button onClick={() => toggleTheme('sepia')} className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} aria-label="Sepia Mode"><BookOpen size={18} /></button>
                    </div>
                </div>

                {/* Mobile Nav Toggle */}
                <button 
                    className="mobile-toggle" 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        className="mobile-nav"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ul>
                            {links.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={location.pathname === link.path ? 'active' : ''}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {!isAuthenticated && (
                                <>
                                    <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
                                    <li><Link to="/register" onClick={() => setIsOpen(false)}>Register</Link></li>
                                </>
                            )}
                        </ul>

                        <div className="nav-controls mobile-controls">
                            <span className="user-points" title="Sanctuary Points">{points} pts</span>
                            {isAuthenticated && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to="/my-works" onClick={() => setIsOpen(false)} className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
                                        <User size={14} style={{ marginRight: '0.25rem' }} /> My Works
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            )}
                            <div className="theme-toggles">
                                <button onClick={() => toggleTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} aria-label="Light Mode"><Sun size={18} /></button>
                                <button onClick={() => toggleTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} aria-label="Dark Mode"><Moon size={18} /></button>
                                <button onClick={() => toggleTheme('sepia')} className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} aria-label="Sepia Mode"><BookOpen size={18} /></button>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            <AmbientPlayer isOpen={ambientOpen} onClose={() => setAmbientOpen(false)} />
        </header>
    )
}

