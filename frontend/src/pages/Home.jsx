import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Pencil, PlusSquare } from 'lucide-react'
import Card from '../components/Card'
import Bookshelf from '../components/Bookshelf'
import HeroTree from '../components/HeroTree'
import HeroWidgets from '../components/HeroWidgets'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useUser } from '../context/UserContext'
import { getDailyPrompt } from '../api/prompts'
import useDocumentMeta from '../hooks/useDocumentMeta'
import './Home.css'

export default function Home() {
    useDocumentMeta({
        title: 'The Unsaid Page',
        description: 'A quiet sanctuary to read and share poems, stories, and reflections.',
    })
    const [dailyPrompt, setDailyPrompt] = useState('')
    const [streak, setStreak] = useState(0)
    const { isAuthenticated } = useUser()
    const { shelfArray, removeFromShelf } = useReadingProgress()
    const featuredRef = useRef(null)
    const { scrollYProgress: featuredScroll } = useScroll({
        target: featuredRef,
        offset: ["start end", "end start"]
    })
    const featuredY = useTransform(featuredScroll, [0, 1], [60, -30])
    const featuredOpacity = useTransform(featuredScroll, [0, 0.3, 0.8, 1], [0, 1, 1, 0.7])

    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
        })
    }

    useEffect(() => {
        getDailyPrompt()
            .then((res) => setDailyPrompt(res.prompt))
            .catch(() => setDailyPrompt('Write about a silence that changed your life.'))
    }, [])

    useEffect(() => {
        const key = new Date().toISOString().slice(0, 10)
        const last = localStorage.getItem('unsaid-last-visit')
        let next = parseInt(localStorage.getItem('unsaid-streak') || '0', 10)
        if (last !== key) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
            next = last === yesterday ? next + 1 : 1
            localStorage.setItem('unsaid-streak', String(next))
            localStorage.setItem('unsaid-last-visit', key)
        }
        setStreak(next)
    }, [])

    const streakLabel = useMemo(() => `${streak} day${streak === 1 ? '' : 's'} streak`, [streak])

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
        >
            {/* ─── Hero Section — Glass Forest ─── */}
            <section className="hero-section">
                <HeroTree />
                <div className="container hero-container">
                    <div className="hero-content">
                        <motion.p
                            className="hero-eyebrow"
                            variants={fadeUp}
                            custom={0}
                        >
                            ✦ a sanctuary for words
                        </motion.p>
                        <motion.h1 variants={fadeUp} custom={1} className="hero-title">
                            The <br />
                            <span className="title-accent">Unsaid Page</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} custom={2} className="hero-tagline">
                            Where silence finds its voice.
                            <br />
                            A quiet space to write, read, and feel
                            <br />
                            the words we never say out loud.
                        </motion.p>
                        <motion.div variants={fadeUp} custom={3} className="hero-buttons">
                            <Link to="/submit" className="btn btn-primary">
                                Start Writing <Pencil size={16} />
                            </Link>
                            <Link to="/poems" className="btn">
                                Explore Poems <PlusSquare size={16} />
                            </Link>
                        </motion.div>
                    </div>
                    <HeroWidgets />
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <span className="scroll-line" />
                </motion.div>
            </section>

            {/* ─── Philosophy / About Strip ─── */}
            <motion.section
                className="philosophy-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9 }}
            >
                <div className="container philosophy-content">
                    <div className="philosophy-columns">
                        <div className="philosophy-col">
                            <span className="philosophy-icon">✦</span>
                            <h3>Read</h3>
                            <p>Discover poetry and prose that speaks to the quiet corners of the mind.</p>
                        </div>
                        <div className="philosophy-divider" />
                        <div className="philosophy-col">
                            <span className="philosophy-icon">♡</span>
                            <h3>Feel</h3>
                            <p>Snap to appreciate. Every word carries weight — let it know it was heard.</p>
                        </div>
                        <div className="philosophy-divider" />
                        <div className="philosophy-col">
                            <span className="philosophy-icon">⊹</span>
                            <h3>Write</h3>
                            <p>Share your unsaid words. This is your page — fill it with what matters.</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ─── Daily Prompt / Ritual ─── */}
            <section className="container daily-ritual">
                <motion.div
                    className="ritual-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="ritual-label">Today&apos;s Prompt</p>
                    <h3 className="ritual-prompt">{dailyPrompt}</h3>
                    <div className="ritual-footer">
                        <span className="ritual-streak">{streakLabel}</span>
                        <Link to="/submit" className="btn btn-primary">Start Writing</Link>
                    </div>
                </motion.div>
            </section>

            {/* ─── Editorial Quote ─── */}
            <motion.section
                className="quote-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container">
                    <blockquote className="editorial-quote">
                        <span className="quote-mark">"</span>
                        <p>There is no greater agony than bearing an untold story inside you.</p>
                        <cite>— Maya Angelou</cite>
                    </blockquote>
                </div>
            </motion.section>

            {/* ─── Continue Reading Bookshelf ─── */}
            {isAuthenticated && shelfArray.length > 0 && (
                <section className="container bookshelf-section" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
                    <div className="section-header" style={{ marginBottom: '1rem' }}>
                        <h2>Continue Reading</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Pick up where you left off</p>
                    </div>
                    <Bookshelf books={shelfArray} onRemove={removeFromShelf} />
                </section>
            )}

            {/* ─── Featured Section with Scroll Animation ─── */}
            <motion.section
                ref={featuredRef}
                className="featured-section container"
                style={{ y: featuredY, opacity: featuredOpacity }}
            >
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Featured Works</h2>
                    <div className="section-line"></div>
                </motion.div>

                <div className="featured-grid">
                    {[
                        {
                            tag: "Editor's Pick",
                            title: 'The Road Not Taken',
                            author: 'Robert Frost',
                            excerpt: 'Two roads diverged in a yellow wood, and sorry I could not travel both…',
                            imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            linkTo: '/read/road-not-taken',
                            readingTime: '1 min read',
                        },
                        {
                            tag: 'Featured Poem',
                            title: 'The Ball Poem',
                            author: 'John Berryman',
                            excerpt: 'What is the boy now, who has lost his ball, what, what is he to do?',
                            imgUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            linkTo: '/read/the-ball-poem',
                            readingTime: '1 min read',
                        },
                        {
                            tag: 'Story',
                            title: 'Wuthering Heights',
                            author: 'Emily Brontë',
                            excerpt: 'Whatever our souls are made of, his and mine are the same.',
                            imgUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            linkTo: '/read/wuthering-heights',
                            readingTime: '2 min read',
                        },
                        {
                            tag: 'Classic',
                            title: 'Stopping by Woods on a Snowy Evening',
                            author: 'Robert Frost',
                            excerpt: 'The woods are lovely, dark and deep, but I have promises to keep…',
                            imgUrl: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            linkTo: '/read/stopping-by-woods',
                            readingTime: '1 min read',
                        },
                        {
                            tag: 'Sonnet',
                            title: 'Shall I Compare Thee to a Summer\'s Day?',
                            author: 'William Shakespeare',
                            excerpt: 'Thou art more lovely and more temperate; rough winds do shake the darling buds of May…',
                            imgUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                            linkTo: '/read/sonnet-18',
                            readingTime: '1 min read',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.linkTo}
                            className="featured-card-wrapper"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card {...item} />
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ─── CTA Section ─── */}
            <motion.section
                className="cta-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
            >
                <div className="container cta-content">
                    <h2>Have something unsaid?</h2>
                    <p>Share your poems, stories, and reflections with a community that listens.</p>
                    <Link to="/submit" className="btn btn-primary">Start Writing</Link>
                </div>
            </motion.section>
        </motion.div>
    )
}
