import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, BookOpen, Clock, CheckCircle, XCircle, Edit3, FileText, Calendar } from 'lucide-react'
import { fetchMyPosts, deletePost } from '../api/posts'
import { useUser } from '../context/UserContext'
import './MyWorks.css'

export default function MyWorks() {
    const { isAuthenticated } = useUser()
    const [works, setWorks] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) return;
        loadWorks()
    }, [isAuthenticated])

    const loadWorks = async () => {
        try {
            setLoading(true)
            const data = await fetchMyPosts()
            setWorks(data || [])
        } catch (err) {
            console.error('Failed to load works:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
        try {
            setDeletingId(id)
            await deletePost(id)
            setWorks(prev => prev.filter(w => w.id !== id))
        } catch (err) {
            console.error('Failed to delete post:', err)
            alert('Could not delete this piece. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ paddingTop: 'var(--nav-height)', textAlign: 'center', paddingBottom: '4rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>Sign in to view your works</h2>
                <Link to="/login" className="btn btn-primary">Log In</Link>
            </div>
        )
    }

    const published = works.filter(w => w.status === 'published').length
    const pending = works.filter(w => w.status === 'pending').length

    const statusIcon = (status) => {
        if (status === 'published') return <CheckCircle size={12} />
        if (status === 'rejected') return <XCircle size={12} />
        return <Clock size={12} />
    }

    return (
        <motion.div
            className="my-works-page container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
        >
            {/* Header */}
            <div className="works-header">
                <div className="works-header-text">
                    <h1>My Works</h1>
                    <p>Your poems, stories, and quiet reflections — all in one place.</p>
                </div>
                <Link to="/submit" className="btn btn-primary">
                    <Edit3 size={15} /> Write Something New
                </Link>
            </div>

            {/* Stats */}
            {!loading && works.length > 0 && (
                <div className="works-stats">
                    <div className="stat-pill">
                        <FileText size={14} />
                        <span className="stat-count">{works.length}</span>
                        Total
                    </div>
                    <div className="stat-pill">
                        <CheckCircle size={14} />
                        <span className="stat-count">{published}</span>
                        Published
                    </div>
                    {pending > 0 && (
                        <div className="stat-pill">
                            <Clock size={14} />
                            <span className="stat-count">{pending}</span>
                            Pending
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-shimmer" />
                    Loading your pieces…
                </div>
            ) : works.length === 0 ? (
                <div className="empty-works-state brutal-card">
                    <FileText size={52} className="empty-icon" />
                    <h2>A blank page awaits</h2>
                    <p>You haven't submitted anything yet. Share your first poem or story with the sanctuary.</p>
                    <Link to="/submit" className="btn btn-primary">Start Writing</Link>
                </div>
            ) : (
                <div className="works-grid">
                    <AnimatePresence mode="popLayout">
                        {works.map((work) => (
                            <motion.div
                                key={work.id}
                                className="work-card brutal-card"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.25 }}
                                layout
                            >
                                <div className="work-card-content">
                                    {/* Type + Status */}
                                    <div className="work-meta">
                                        <span className="work-type-badge">
                                            {work.type}
                                        </span>
                                        <span className={`work-status-badge status-${work.status}`}>
                                            {statusIcon(work.status)}
                                            {work.status}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3>{work.title}</h3>

                                    {/* Date */}
                                    <p className="work-date">
                                        <Calendar size={12} />
                                        {new Date(work.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    {/* Excerpt */}
                                    <p className="work-excerpt">
                                        {work.excerpt || '…'}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="work-actions">
                                    {work.status === 'published' && work.slug ? (
                                        <Link to={`/read/${work.slug}`} className="btn-sm btn-read">
                                            <BookOpen size={13} /> Read
                                        </Link>
                                    ) : (
                                        <span className="btn-sm btn-disabled">
                                            <Clock size={13} /> Pending Review
                                        </span>
                                    )}
                                    <button
                                        className="btn-sm btn-delete"
                                        onClick={() => handleDelete(work.id, work.title)}
                                        disabled={deletingId === work.id}
                                        title="Delete this piece"
                                        aria-label={`Delete ${work.title}`}
                                    >
                                        <Trash2 size={13} />
                                        {deletingId === work.id ? '…' : 'Delete'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    )
}
