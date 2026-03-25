import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, BookOpen, Trash2, Library } from 'lucide-react';
import { createCollection, fetchCollectionItems, fetchCollections, addToCollection, deleteCollection } from '../api/collections';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { fetchPostById } from '../data/mockApi';

export default function Collections() {
    useDocumentMeta({
        title: 'Collections | The Unsaid Page',
        description: 'Organize your saved stories and poems into curated collections.',
    });

    const [collections, setCollections] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchCollections()
            .then((res) => {
                setCollections(res);
                if (res.length > 0) setActiveId(res[0].id);
            })
            .catch(() => {
                setError('Sign in to manage collections.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!activeId) return;
        setItemsLoading(true);
        fetchCollectionItems(activeId)
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setItemsLoading(false));
    }, [activeId]);

    const handleCreate = async () => {
        const trimmed = name.trim();
        if (trimmed.length < 2) return;
        try {
            const created = await createCollection(trimmed);
            setCollections((prev) => [created, ...prev]);
            setActiveId(created.id);
            setName('');
            setError('');
        } catch {
            setError('Collection name already exists or failed to create.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this collection and all its contents?')) return;
        try {
            await deleteCollection(id);
            setCollections((prev) => {
                const updated = prev.filter(c => c.id !== id);
                if (activeId === id) {
                    setActiveId(updated.length > 0 ? updated[0].id : '');
                }
                return updated;
            });
        } catch (err) {
            setError('Failed to delete collection.');
        }
    };

    const activeCollection = collections.find(c => c.id === activeId);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container"
            style={{ padding: '4rem 2rem', minHeight: '80vh' }}
        >
            {/* Header */}
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                    <span className="title-accent">Collections</span>
                </h1>
                <div className="section-line"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', maxWidth: '500px', margin: '1.5rem auto 0' }}>
                    Create reading playlists and revisit your favorite pieces.
                </p>
            </header>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="brutal-card"
                    style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', textAlign: 'center', padding: '1.5rem' }}
                >
                    <Library size={24} style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
                    <p>{error}</p>
                </motion.div>
            )}

            {/* Create New Collection */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <input
                    className="brutal-input"
                    placeholder="e.g. Rainy Evening Reads"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    style={{ maxWidth: '300px', flex: '1' }}
                />
                <button className="btn btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> New Collection
                </button>
            </div>

            {/* Collection Tabs */}
            {collections.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginBottom: '2.5rem'
                }}>
                    {collections.map((c) => (
                        <motion.button
                            key={c.id}
                            className={`btn ${activeId === c.id ? 'btn-primary' : ''}`}
                            onClick={() => setActiveId(c.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                borderRadius: '50px',
                                padding: '0.5rem 1.25rem',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <FolderOpen size={14} />
                            {c.name}
                            <span style={{
                                background: activeId === c.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                {c.item_count}
                            </span>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Active Collection Header */}
            {activeCollection && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderOpen size={20} style={{ color: 'var(--accent-color)' }} />
                        {activeCollection.name}
                    </h2>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => handleDelete(activeCollection.id)}
                        style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--accent-color)', borderColor: 'rgba(201, 149, 107, 0.2)' }}
                        title="Delete Collection"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Items Grid */}
            {itemsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {[1,2,3].map(i => (
                        <div key={i} className="brutal-card" style={{ padding: '1.5rem', opacity: 0.5 }}>
                            <div style={{ height: '1.2rem', background: 'var(--glass-bg)', borderRadius: '6px', marginBottom: '0.75rem', width: '70%' }}></div>
                            <div style={{ height: '0.9rem', background: 'var(--glass-bg)', borderRadius: '6px', width: '90%' }}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.35, delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/read/${item.slug}`}
                                    className="brutal-card"
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {item.cover_image_url ? (
                                        <img
                                            src={item.cover_image_url}
                                            alt={item.title}
                                            style={{
                                                width: '60px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-sm)',
                                                flexShrink: 0
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '60px',
                                            height: '80px',
                                            background: 'linear-gradient(135deg, var(--accent-color), var(--warm-gold))',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <BookOpen size={20} color="#fff" />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            {item.type && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    fontWeight: 700,
                                                    color: 'var(--accent-color)',
                                                    background: 'rgba(201, 149, 107, 0.1)',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '12px'
                                                }}>
                                                    {item.type}
                                                </span>
                                            )}
                                            {item.reading_time_label && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {item.reading_time_label}
                                                </span>
                                            )}
                                        </div>
                                        <strong style={{ fontSize: '1rem', display: 'block' }}>{item.title}</strong>
                                        <p style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.85rem',
                                            marginTop: '0.25rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.excerpt || 'No excerpt available.'}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Empty State */}
            {!itemsLoading && !items.length && activeId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)'
                    }}
                >
                    <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem' }}>This collection is empty.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Open a story or poem and click <strong>"Save This Piece"</strong> to add it here.
                    </p>
                </motion.div>
            )}

            {/* No collections at all */}
            {!loading && collections.length === 0 && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)'
                    }}
                >
                    <FolderOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem' }}>You haven't created any collections yet.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Use the input above to create your first reading playlist!
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
