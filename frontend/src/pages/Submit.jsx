import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { submitPost } from '../data/mockApi'
import { fetchMyDraft, saveMyDraft, clearMyDraft } from '../api/drafts'
import ReactMarkdown from 'react-markdown'
import VoidAnimation from '../components/VoidAnimation'
import WritingPrompts from '../components/WritingPrompts'
import { Maximize2, X } from 'lucide-react'
import './Submit.css'

// ── Typewriter Audio Synthesis ──
function useTypewriterSound(enabled) {
    const audioCtxRef = useRef(null)

    const playClick = useCallback(() => {
        if (!enabled) return
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }
            const ctx = audioCtxRef.current
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()

            // Vary pitch slightly for realism
            const pitches = [800, 900, 1000, 850, 950]
            oscillator.frequency.value = pitches[Math.floor(Math.random() * pitches.length)]
            oscillator.type = 'sine'

            gain.gain.setValueAtTime(0.03, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

            oscillator.connect(gain)
            gain.connect(ctx.destination)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.05)
        } catch { /* audio not supported */ }
    }, [enabled])

    return playClick
}

export default function Submit() {
    const getSavedDraft = () => {
        try {
            const saved = localStorage.getItem('unsaid-draft');
            if (saved) return JSON.parse(saved);
        } catch { /* corrupted draft, ignore */ }
        return { name: '', email: '', title: '', type: 'poem', content: '', moodsInput: '', tagsInput: '', anonymous: false };
    };

    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        defaultValues: getSavedDraft(),
    });

    const [submitted, setSubmitted] = useState(false);
    const [voidTriggered, setVoidTriggered] = useState(false);
    const [serverError, setServerError] = useState('');
    const { isAuthenticated } = useUser();
    
    const watchedContent = watch('content') || '';
    const watchedValues = watch();
    const [zenMode, setZenMode] = useState(false);

    // Typewriter sound — only active in zen mode
    const playClick = useTypewriterSound(zenMode)

    // ESC exits zen mode
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setZenMode(false); };
        if (zenMode) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [zenMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentData = watchedValues;
            localStorage.setItem('unsaid-draft', JSON.stringify(currentData));
            if (isAuthenticated) saveMyDraft(currentData).catch(() => {});
        }, 800);
        return () => clearTimeout(timer);
    }, [watchedValues, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchMyDraft()
            .then((draft) => {
                if (!draft?.form_state) return;
                Object.entries(draft.form_state).forEach(([k, v]) => setValue(k, v));
            })
            .catch(() => {});
    }, [isAuthenticated, setValue]);

    const onSubmit = async (data) => {
        try {
            setServerError('');
            const moods = (data.moodsInput || '').split(',').map((m) => m.trim()).filter(Boolean);
            const tags = (data.tagsInput || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
            await submitPost({ ...data, moods, tags, anonymous: Boolean(data.anonymous) });
            localStorage.removeItem('unsaid-draft');
            if (isAuthenticated) await clearMyDraft().catch(() => {});
            setVoidTriggered(true);
            reset();
        } catch (err) {
            setServerError(err.response?.data?.error || err.message || 'Submission failed');
        }
    };

    const handleVoidComplete = () => {
        setSubmitted(true); // show success message after void finishes
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container submit-container"
            style={{ maxWidth: '1000px' }}
        >
            <header className="submit-header">
                <h1>Share Your Words</h1>
                <div className="section-line"></div>
                <p>This is a safe space for your unsaid thoughts. We welcome poems, stories, and quiet reflections. (Supports Markdown!)</p>
            </header>

            {/* Writing Prompts */}
            <WritingPrompts />

            {!isAuthenticated && (
                <div className="brutal-card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem', borderColor: 'var(--accent-color)' }}>
                    <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Sign in to share your words with the sanctuary</p>
                    <Link to="/login" className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Login</Link>
                    <Link to="/register" className="btn">Register</Link>
                </div>
            )}

            {serverError && (
                <div className="brutal-card" style={{ borderColor: 'var(--accent-color)', background: 'rgba(255,51,102,0.08)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                    {serverError}
                </div>
            )}

            {submitted ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-message brutal-card"
                >
                    <h2>Thank You</h2>
                    <p>Your piece has been submitted and will be reviewed shortly.</p>
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>+10 Points earned!</p>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => { setSubmitted(false); setVoidTriggered(false); }}
                    >
                        Submit Another
                    </button>
                </motion.div>
            ) : (
                <>
                <VoidAnimation trigger={voidTriggered} onComplete={handleVoidComplete}>
                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="submit-form brutal-card"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="name">Pen Name (or leave blank for Anonymous)</label>
                            <input
                                type="text"
                                id="name"
                                {...register('name')}
                                className="brutal-input"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email <span className="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                {...register('email', { 
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="brutal-input"
                                placeholder="jane@example.com"
                            />
                            {errors.email && <span className="error-msg">{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Type of Submission</label>
                            <div className="radio-group" style={{ marginTop: '0.8rem' }}>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="poem"
                                        {...register('type')}
                                    />
                                    <span className="radio-custom"></span>
                                    Poem
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="story"
                                        {...register('type')}
                                    />
                                    <span className="radio-custom"></span>
                                    Story
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Title <span className="required">*</span></label>
                            <input
                                type="text"
                                id="title"
                                {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 chars' } })}
                                className="brutal-input"
                                placeholder="The Title of Your Piece"
                            />
                            {errors.title && <span className="error-msg">{errors.title.message}</span>}
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="moodsInput">Moods (comma-separated)</label>
                            <input id="moodsInput" {...register('moodsInput')} className="brutal-input" placeholder="quiet, healing, late-night" />
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                {['quiet', 'healing', 'heartbreak', 'late-night', 'nostalgic', 'joyful', 'melancholic', 'dreamy', 'romantic', 'angry', 'hopeful', 'reflective'].map(m => {
                                    const currentMoods = (watchedValues.moodsInput || '').split(',').map(s => s.trim()).filter(Boolean);
                                    const isSelected = currentMoods.includes(m);
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setValue('moodsInput', currentMoods.filter(x => x !== m).join(', '));
                                                } else {
                                                    setValue('moodsInput', [...currentMoods, m].join(', '));
                                                }
                                            }}
                                            style={{
                                                background: isSelected ? 'var(--accent-color)' : 'transparent',
                                                color: isSelected ? 'var(--bg-color)' : 'var(--text-color)',
                                                border: '2px solid var(--accent-color)',
                                                padding: '0.2rem 0.6rem',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                                textTransform: 'uppercase',
                                                fontWeight: 700,
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="tagsInput">Tags (comma-separated)</label>
                            <input id="tagsInput" {...register('tagsInput')} className="brutal-input" placeholder="nostalgia, monsoon, memory" />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '-0.5rem' }}>
                        <label className="radio-label" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                            <input type="checkbox" {...register('anonymous')} style={{ marginRight: '0.5rem' }} />
                            Publish as anonymous
                        </label>
                    </div>

                    <div className="content-preview-split">
                        <div className="form-group">
                            <label htmlFor="content">Your Piece <span className="required">*</span></label>
                            <textarea
                                id="content"
                                {...register('content', { 
                                    required: 'Content is required', 
                                    minLength: { value: 20, message: 'Your piece must be at least 20 characters' } 
                                })}
                                rows="12"
                                className="brutal-input"
                                placeholder="Start writing (Markdown supported like **bold**)..."
                                style={{ resize: 'vertical' }}
                            ></textarea>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: watchedContent.length > 5000 ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                                {watchedContent.length} / 5000 characters
                            </div>
                            {errors.content && <span className="error-msg">{errors.content.message}</span>}
                            <button type="button" className="zen-toggle" onClick={() => setZenMode(true)} title="Focus mode">
                                <Maximize2 size={14} /> Focus
                            </button>
                        </div>
                        
                        <div className="form-group preview-pane">
                            <label>Live Preview</label>
                            <div className="brutal-card preview-content">
                                {watchedContent ? (
                                    <ReactMarkdown>{watchedContent}</ReactMarkdown>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Preview will appear here...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send to The Void'}
                    </button>
                </motion.form>
                </VoidAnimation>

                {/* Zen Writing Mode Overlay */}
                <AnimatePresence>
                    {zenMode && (
                        <motion.div
                            className="zen-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="zen-glow" />
                            <button className="zen-close" onClick={() => setZenMode(false)} aria-label="Exit focus mode">
                                <X size={20} /> <span>ESC</span>
                            </button>
                            <div className="zen-content">
                                <textarea
                                    value={watchedContent}
                                    onChange={(e) => {
                                        const field = register('content');
                                        field.onChange({ target: { name: 'content', value: e.target.value } });
                                    }}
                                    onKeyDown={playClick}
                                    className="zen-textarea"
                                    placeholder="Let your thoughts flow..."
                                    autoFocus
                                />
                                <div className="zen-counter">
                                    {watchedContent.length} / 5000
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                </>
            )}
        </motion.div>
    )
}
