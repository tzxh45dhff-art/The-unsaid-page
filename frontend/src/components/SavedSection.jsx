import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookmarkCheck, MessageSquare, Trash2, Send, Check, AlertCircle } from 'lucide-react'
import { fetchCollections, createCollection, addToCollection, removeFromCollection } from '../api/collections'
import { useUser } from '../context/UserContext'
import './SavedSection.css'

const SAVED_KEY = 'unsaid-saved-posts'
const COMMENTS_KEY = 'unsaid-comments'

export default function SavedSection({ postId, title, highlights = [] }) {
    const { isAuthenticated } = useUser()
    // Save state
    const [isSaved, setIsSaved] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
            return saved.includes(postId)
        } catch { return false }
    })

    // Comments
    const [comments, setComments] = useState(() => {
        try {
            const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}')
            return all[postId] || []
        } catch { return [] }
    })

    const [newComment, setNewComment] = useState('')
    const [collections, setCollections] = useState([])
    const [selectedCollection, setSelectedCollection] = useState('')
    const [newCollection, setNewCollection] = useState('')
    const [saveStatus, setSaveStatus] = useState('') // 'saving', 'saved', 'error'

    // Persist save state
    const toggleSave = useCallback(async () => {
        // Only use collections API for authenticated users
        if (isAuthenticated && selectedCollection) {
            setSaveStatus('saving');
            try {
                await addToCollection(selectedCollection, postId);
                setIsSaved(true);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(''), 3000);
            } catch (err) {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(''), 3000);
            }
            return;
        }
        if (isAuthenticated && !selectedCollection && collections.length === 0) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
            return;
        }
        // Local save (for mock content or non-authenticated users)
        setIsSaved(prev => {
            const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
            let updated
            if (prev) {
                updated = saved.filter(id => id !== postId)
            } else {
                updated = [...saved, postId]
            }
            localStorage.setItem(SAVED_KEY, JSON.stringify(updated))
            return !prev
        })
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
    }, [postId, isAuthenticated, selectedCollection, collections])

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchCollections()
            .then((res) => {
                setCollections(res);
                if (res[0]) setSelectedCollection(res[0].id);
            })
            .catch(() => {});
    }, [isAuthenticated]);

    const handleCreateCollection = async () => {
        const name = newCollection.trim();
        if (!name) return;
        try {
            const created = await createCollection(name);
            setCollections((prev) => [created, ...prev]);
            setSelectedCollection(created.id);
            setNewCollection('');
        } catch {
            // no-op
        }
    };

    // Persist comments
    useEffect(() => {
        try {
            const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}')
            all[postId] = comments
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
        } catch { /* ignore */ }
    }, [comments, postId])

    const addComment = () => {
        const text = newComment.trim()
        if (!text) return
        setComments(prev => [...prev, {
            id: Date.now(),
            text,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        }])
        setNewComment('')
    }

    const removeComment = (id) => {
        setComments(prev => prev.filter(c => c.id !== id))
    }

    // Get highlighted lines from localStorage
    const [savedHighlights, setSavedHighlights] = useState([])
    useEffect(() => {
        try {
            const hl = JSON.parse(localStorage.getItem('unsaid-highlights') || '{}')
            setSavedHighlights(hl[postId] || [])
        } catch { setSavedHighlights([]) }
    }, [postId])

    return (
        <motion.section
            className="saved-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Save Button */}
            <div className="save-header">
                {!isSaved ? (
                    <div style={{ width: '100%' }}>
                        <button
                            className="save-btn"
                            onClick={() => toggleSave()}
                            disabled={saveStatus === 'saving'}
                        >
                            {saveStatus === 'saving' ? '⏳' : <Bookmark size={20} />}
                            {saveStatus === 'saving' ? 'Saving...' : 'Save This Piece'}
                        </button>
                        
                        {isAuthenticated && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(201, 149, 107, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(201, 149, 107, 0.1)' }}
                            >
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Choose a collection:</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    {collections.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCollection(c.id)}
                                            className={`btn ${selectedCollection === c.id ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '0.3rem 0.75rem', 
                                                borderRadius: '20px',
                                                borderColor: selectedCollection === c.id ? 'var(--accent-color)' : 'rgba(201, 149, 107, 0.3)'
                                            }}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                    {collections.length === 0 && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>No collections yet</span>}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <input
                                        className="comment-input"
                                        value={newCollection}
                                        onChange={(e) => setNewCollection(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                                        placeholder="Or create new..."
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    />
                                    <button 
                                        className="comment-send" 
                                        onClick={handleCreateCollection}
                                        style={{ padding: '0 0.75rem' }}
                                    >+</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <button
                            className="save-btn saved"
                            onClick={async () => {
                                if (!isAuthenticated || !selectedCollection) {
                                    setIsSaved(false);
                                    return;
                                }
                                setSaveStatus('saving');
                                try {
                                    await removeFromCollection(selectedCollection, postId);
                                    setIsSaved(false);
                                    setSaveStatus('');
                                } catch (err) {
                                    setSaveStatus('error');
                                    setTimeout(() => setSaveStatus(''), 3000);
                                }
                            }}
                            disabled={saveStatus === 'saving'}
                            title="Click to remove from collection"
                        >
                            {saveStatus === 'saving' ? '⏳' : <BookmarkCheck size={20} />}
                            {saveStatus === 'saving' ? 'Removing...' : 'Saved to Collection'}
                        </button>
                        {selectedCollection && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Saved in <strong>{collections.find(c => c.id === selectedCollection)?.name || 'Collection'}</strong>. 
                                View in <a href="/collections" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Collections</a>
                            </p>
                        )}
                    </div>
                )}

                {saveStatus === 'saved' && (
                    <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}
                    >
                        <Check size={14} /> Added successfully!
                    </motion.span>
                )}
                {saveStatus === 'error' && (
                    <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}
                    >
                        <AlertCircle size={14} /> {collections.length === 0 ? 'Create a collection first' : 'Failed to save — please try again'}
                    </motion.span>
                )}
            </div>

            {/* Highlighted Lines Summary */}
            {savedHighlights.length > 0 && (
                <div className="highlights-summary">
                    <h4 className="section-label">
                        <span className="label-dot" />
                        Your Highlighted Lines ({savedHighlights.length})
                    </h4>
                    <div className="highlights-list">
                        {savedHighlights.map((lineIdx) => (
                            <div key={lineIdx} className="highlight-item">
                                <span className="hl-marker">line {lineIdx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Personal Comments */}
            <div className="comments-area">
                <h4 className="section-label">
                    <MessageSquare size={14} />
                    Personal Notes
                </h4>

                <div className="comment-input-row">
                    <input
                        type="text"
                        className="comment-input"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addComment()}
                        placeholder="Write a personal note about this piece..."
                        maxLength={500}
                    />
                    <button
                        className="comment-send"
                        onClick={addComment}
                        disabled={!newComment.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>

                <AnimatePresence>
                    {comments.map(comment => (
                        <motion.div
                            key={comment.id}
                            className="comment-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="comment-text">{comment.text}</p>
                            <div className="comment-footer">
                                <span className="comment-date">{comment.date}</span>
                                <button
                                    className="comment-delete"
                                    onClick={() => removeComment(comment.id)}
                                    aria-label="Delete note"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <p className="comment-empty">No notes yet. Jot down your thoughts on this piece.</p>
                )}
            </div>
        </motion.section>
    )
}
