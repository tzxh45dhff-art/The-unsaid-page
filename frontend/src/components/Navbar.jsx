import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'
import { Menu, X, Sun, Moon, BookOpen, LogOut, User, Headphones } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { useSeason } from '../context/SeasonContext'
import AmbientPlayer from './AmbientPlayer'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [ambientOpen, setAmbientOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const { points, user, isAuthenticated, logout } = useUser()
    const { season, cycleSeason, config: seasonConfig } = useSeason()

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

    /* Slightly increase backdrop opacity on scroll for readability */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header className={`navbar-float ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-pill">
                {/* Left — Logo */}
                <Link to="/" className="pill-logo" onClick={() => setIsOpen(false)}>
                    The Unsaid Page
                </Link>

                {/* Center — compact nav links (desktop) */}
                <nav className="pill-links desktop-only">
                    {links.slice(0, 5).map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`pill-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Right — actions */}
                <div className="pill-actions">
                    {/* Season toggle */}
                    <button
                        onClick={cycleSeason}
                        className="pill-btn season-toggle"
                        aria-label={`Season: ${season}`}
                        title={`Switch season (${seasonConfig.label})`}
                    >
                        {seasonConfig.label.split(' ')[0]}
                    </button>

                    {/* Theme toggles (desktop) */}
                    <div className="pill-themes desktop-only">
                        <button onClick={() => toggleTheme('light')} className={`pill-btn ${theme === 'light' ? 'active' : ''}`} aria-label="Light"><Sun size={15} /></button>
                        <button onClick={() => toggleTheme('dark')} className={`pill-btn ${theme === 'dark' ? 'active' : ''}`} aria-label="Dark"><Moon size={15} /></button>
                        <button onClick={() => toggleTheme('sepia')} className={`pill-btn ${theme === 'sepia' ? 'active' : ''}`} aria-label="Sepia"><BookOpen size={15} /></button>
                    </div>

                    {/* Ambient sound */}
                    <button
                        onClick={() => setAmbientOpen(o => !o)}
                        className={`pill-btn desktop-only ${ambientOpen ? 'active' : ''}`}
                        aria-label="Ambient Sounds"
                        title="Ambient Sounds"
                    >
                        <Headphones size={15} />
                    </button>

                    {/* Points badge (desktop) */}
                    <span className="pill-points desktop-only" title="Sanctuary Points">{points} pts</span>

                    {/* User / Auth (desktop) */}
                    {isAuthenticated ? (
                        <div className="pill-user desktop-only">
                            <Link to="/my-works" className="pill-username">
                                <User size={13} />
                                {user?.display_name || user?.username}
                            </Link>
                            <button onClick={logout} className="pill-btn" aria-label="Logout" title="Logout">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="pill-login desktop-only">Login</Link>
                    )}

                    {/* Hamburger */}
                    <button
                        className="pill-btn pill-hamburger"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* ─── Dropdown Overlay ─── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="pill-dropdown"
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <nav className="dropdown-links">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`dropdown-link ${location.pathname === link.path ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="dropdown-divider" />

                        <div className="dropdown-controls">
                            <span className="pill-points" title="Sanctuary Points">{points} pts</span>

                            <div className="dropdown-themes">
                                <button onClick={() => toggleTheme('light')} className={`pill-btn ${theme === 'light' ? 'active' : ''}`} aria-label="Light"><Sun size={16} /></button>
                                <button onClick={() => toggleTheme('dark')} className={`pill-btn ${theme === 'dark' ? 'active' : ''}`} aria-label="Dark"><Moon size={16} /></button>
                                <button onClick={() => toggleTheme('sepia')} className={`pill-btn ${theme === 'sepia' ? 'active' : ''}`} aria-label="Sepia"><BookOpen size={16} /></button>
                                <button onClick={() => setAmbientOpen(o => !o)} className={`pill-btn ${ambientOpen ? 'active' : ''}`} aria-label="Ambient Sounds"><Headphones size={16} /></button>
                            </div>

                            {isAuthenticated ? (
                                <div className="dropdown-user-row">
                                    <Link to="/my-works" onClick={() => setIsOpen(false)} className="dropdown-user-link">
                                        <User size={14} /> My Works
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="pill-btn" aria-label="Logout">
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="dropdown-auth-row">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="dropdown-auth-btn">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="dropdown-auth-btn outline">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AmbientPlayer isOpen={ambientOpen} onClose={() => setAmbientOpen(false)} />
        </header>
    )
}
