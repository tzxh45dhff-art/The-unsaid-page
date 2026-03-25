import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Type, Layers, Eye } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { fetchPostById } from '../data/mockApi'
import { ReadSkeleton } from '../components/Skeleton'
import SnapButton from '../components/SnapButton'
import PaperPlaneShare from '../components/PaperPlaneShare'
import HighlightableText from '../components/HighlightableText'
import PageFlipReader from '../components/PageFlipReader'
import SavedSection from '../components/SavedSection'
import { useUser } from '../context/UserContext'
import useDocumentMeta from '../hooks/useDocumentMeta'
import './Read.css'

export default function Read() {
    const { id } = useParams()
    const { data, loading, error } = useFetch(fetchPostById, id);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const { awardReadingPoints } = useUser();
    const [awarded, setAwarded] = useState(false);
    const [typoOpen, setTypoOpen] = useState(false);
    const [readMode, setReadMode] = useState('scroll');
    const [focusMode, setFocusMode] = useState(false);

    // Reader typography preferences
    const getPrefs = () => {
        try { return JSON.parse(localStorage.getItem('unsaid-reader-prefs')) || {}; } catch { return {}; }
    };
    const [readerPrefs, setReaderPrefs] = useState(() => ({
        fontFamily: 'serif',
        fontSize: 1.2,
        lineHeight: 1.9,
        texture: 'white-book',
        ...getPrefs(),
    }));

    const updatePref = (key, value) => {
        setReaderPrefs(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('unsaid-reader-prefs', JSON.stringify(next));
            return next;
        });
    };

    const fontMap = {
        serif: "'Playfair Display', serif",
        sans: "'Inter', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
    };

    const textures = [
        { key: 'white-book', label: 'White Book Page', icon: '📄' },
        { key: 'coffee-burnt', label: 'Coffee Burnt', icon: '☕' },
        { key: 'handmade', label: 'Handmade Paper', icon: '🪶' },
        { key: 'aged-manuscript', label: 'Aged Manuscript', icon: '📜' },
        { key: 'linen', label: 'Linen Textured', icon: '🧵' },
    ];
    const serverPostId = data?.dbId || data?.id || id;

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest >= 0.99 && !awarded) {
                awardReadingPoints(serverPostId).catch(() => {});
                setAwarded(true);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, awarded, awardReadingPoints, serverPostId]);

    useEffect(() => {
        document.body.classList.toggle('reader-focus-mode', focusMode);
        return () => document.body.classList.remove('reader-focus-mode');
    }, [focusMode]);

    const article = error || (!loading && !data) ? {
        title: 'Content Not Found',
        date: '',
        author: '',
        type: '',
        body: 'The page you are looking for has faded into the mist.'
    } : data;

    useDocumentMeta({
        title: article ? `${article.title} | The Unsaid Page` : 'Loading... | The Unsaid Page',
        description: article ? (article.excerpt || article.body?.slice(0, 140)) : '',
    });

    if (loading) return <ReadSkeleton />;

    const lines = article.body.split('\n');
    const isStory = article.type === 'Story';

    const fontStyle = {
        fontFamily: fontMap[readerPrefs.fontFamily],
        fontSize: `${readerPrefs.fontSize}rem`,
        lineHeight: readerPrefs.lineHeight,
    };

    return (
        <>
        <motion.div
            style={{
                scaleX,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                originX: 0,
                backgroundColor: 'var(--accent-color)',
                zIndex: 1001
            }}
        />
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="read-container"
        >
            <div className="read-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={-1} className="back-link">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Read Mode Toggle (Stories only) */}
                        {isStory && (
                            <button
                                className={`back-link ${readMode === 'flip' ? 'active' : ''}`}
                                onClick={() => setReadMode(m => m === 'scroll' ? 'flip' : 'scroll')}
                                title={readMode === 'scroll' ? 'Switch to Page Flip' : 'Switch to Scroll'}
                            >
                                <Layers size={18} /> {readMode === 'scroll' ? 'Pages' : 'Scroll'}
                            </button>
                        )}
                        {/* Typography Settings */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className={`back-link ${typoOpen ? 'active' : ''}`}
                                onClick={() => setTypoOpen(o => !o)}
                                aria-label="Typography settings"
                                title="Reading preferences"
                                style={{ cursor: 'pointer' }}
                            >
                                <Type size={18} /> Aa
                            </button>

                            <AnimatePresence>
                                {typoOpen && (
                                    <motion.div
                                        className="typo-popover"
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="typo-section">
                                            <label className="typo-label">Font</label>
                                            <div className="typo-font-btns">
                                                {[['serif','Serif'],['sans','Sans'],['mono','Mono']].map(([k,l]) => (
                                                    <button
                                                        key={k}
                                                        className={`typo-font-btn ${readerPrefs.fontFamily === k ? 'active' : ''}`}
                                                        onClick={() => updatePref('fontFamily', k)}
                                                        style={{ fontFamily: fontMap[k] }}
                                                    >{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="typo-section">
                                            <label className="typo-label">Size — {readerPrefs.fontSize}rem</label>
                                            <input
                                                type="range" min="0.9" max="1.6" step="0.05"
                                                value={readerPrefs.fontSize}
                                                onChange={e => updatePref('fontSize', parseFloat(e.target.value))}
                                                className="typo-slider"
                                            />
                                        </div>
                                        <div className="typo-section">
                                            <label className="typo-label">Spacing</label>
                                            <div className="typo-font-btns">
                                                {[[1.5,'Compact'],[1.9,'Comfortable'],[2.4,'Spacious']].map(([v,l]) => (
                                                    <button
                                                        key={v}
                                                        className={`typo-font-btn ${readerPrefs.lineHeight === v ? 'active' : ''}`}
                                                        onClick={() => updatePref('lineHeight', v)}
                                                    >{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Paper Style */}
                                        <div className="typo-section">
                                            <label className="typo-label">Page Style</label>
                                            <div className="typo-font-btns texture-grid">
                                                {textures.map(t => (
                                                    <button
                                                        key={t.key}
                                                        className={`typo-font-btn ${readerPrefs.texture === t.key ? 'active' : ''}`}
                                                        onClick={() => updatePref('texture', t.key)}
                                                        title={t.label}
                                                    >
                                                        {t.icon} {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            className={`back-link ${focusMode ? 'active' : ''}`}
                            onClick={() => setFocusMode((v) => !v)}
                            title="Toggle focus mode"
                        >
                            <Eye size={18} /> {focusMode ? 'Exit Focus' : 'Focus'}
                        </button>
                    </div>
                </div>
                <div className="article-meta">
                    {article.type && <span className="meta-tag">{article.type}</span>}
                    {article.readingTime && <span className="meta-tag" style={{ backgroundColor: 'var(--brutal-yellow)', color: '#111' }}>{article.readingTime}</span>}
                    <span className="meta-date">{article.date}</span>
                </div>
                <h1 className="article-title">{article.title}</h1>
                {article.author && <p className="article-author">By {article.author}</p>}
                <p className="highlight-hint">✦ Tap any line to highlight it</p>
            </div>

            {readMode === 'flip' && isStory ? (
                <PageFlipReader body={article.body} fontStyle={fontStyle} />
            ) : (
                <div className={`article-body texture-${readerPrefs.texture}`} style={fontStyle}>
                    <HighlightableText lines={lines} postId={article.id || id} />
                </div>
            )}

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <SnapButton postId={article.dbId || article.id} />
                <PaperPlaneShare title={article.title} />
            </div>

            {/* Saved Section with highlights, save button, and personal notes */}
            <SavedSection postId={article.dbId || article.id || id} title={article.title} />
        </motion.article>
        </>
    )
}
