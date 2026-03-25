import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Edit3, Clock, CheckCircle, FileText } from 'lucide-react'
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
        if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
            return;
        }

        try {
            setDeletingId(id)
            await deletePost(id)
            setWorks(works.filter(w => w.id !== id))
        } catch (err) {
            console.error('Failed to delete post:', err)
            alert('Could not delete the post. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h2>You must be logged in to view your works.</h2>
                <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log In</Link>
            </div>
        )
    }

    return (
        <motion.div 
            className="my-works-page container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="works-header">
                <div className="works-header-text">
                    <h1>My Works</h1>
                    <p>Manage the poems, stories, and reflections you've written.</p>
                </div>
                <Link to="/submit" className="btn btn-primary">
                    <Edit3 size={16} /> Write Something New
                </Link>
            </div>

            {loading ? (
                <div className="loading-state">Loading your works...</div>
            ) : works.length === 0 ? (
                <div className="empty-works-state brutal-card">
                    <FileText size={48} className="empty-icon" />
                    <h2>A blank page awaits</h2>
                    <p>You haven't published anything yet. Start writing to let your voice be heard.</p>
                    <Link to="/submit" className="btn btn-primary">Start Writing</Link>
                </div>
            ) : (
                <div className="works-grid">
                    <AnimatePresence>
                        {works.map((work) => (
                            <motion.div 
                                key={work.id} 
                                className="work-card brutal-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                <div className="work-card-content">
                                    <div className="work-meta">
                                        <span className={`work-type type-${work.type}`}>{work.type}</span>
                                        <span className={`work-status status-${work.status}`}>
                                            {work.status === 'published' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {work.status}
                                        </span>
                                    </div>
                                    <h3>{work.title}</h3>
                                    <p className="work-date">
                                        Submitted {new Date(work.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="work-excerpt">
                                        {work.excerpt || "No excerpt provided."}
                                    </p>
                                </div>
                                <div className="work-actions">
                                    {work.status === 'published' ? (
                                        <Link to={`/read/${work.slug}`} className="btn btn-sm">Read</Link>
                                    ) : (
                                        <button className="btn btn-sm disabled" disabled>Pending Review</button>
                                    )}
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => handleDelete(work.id, work.title)}
                                        disabled={deletingId === work.id}
                                    >
                                        <Trash2 size={14} /> {deletingId === work.id ? 'Deleting...' : 'Delete'}
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
