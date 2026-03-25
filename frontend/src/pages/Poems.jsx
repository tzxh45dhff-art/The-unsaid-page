import { motion } from 'framer-motion'
import Card from '../components/Card'
import { useMemo, useState } from 'react'

import { useFetch } from '../hooks/useFetch'
import { fetchPostsList } from '../data/mockApi'
import { CardSkeleton } from '../components/Skeleton'
import './Poems.css'

export default function Poems() {
    const [query, setQuery] = useState('')
    const [mood, setMood] = useState('')
    const { data: poemsList, loading } = useFetch(fetchPostsList, 'Poem', { query, mood })
    const moods = useMemo(() => [
        'quiet', 'healing', 'heartbreak', 'late-night',
        'nostalgic', 'joyful', 'melancholic', 'dreamy',
        'romantic', 'angry', 'hopeful', 'reflective'
    ], [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container poems-page"
        >
            <header className="poems-header">
                <h1>Poems</h1>
                <div className="section-line"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>
                    Verses written in the margins of life.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search poems..."
                        className="brutal-input"
                        style={{ maxWidth: '260px' }}
                    />
                    <select value={mood} onChange={(e) => setMood(e.target.value)} className="brutal-input" style={{ maxWidth: '180px' }}>
                        <option value="">All moods</option>
                        {moods.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </header>

            <div className="poems-grid">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} style={{ height: '400px' }}>
                            <CardSkeleton />
                        </div>
                    ))
                ) : (
                    poemsList?.map((poem, index) => (
                        <div key={poem.id} style={{ height: '100%' }}>
                            <Card
                                tag="Poem"
                                title={poem.title}
                                author={poem.author}
                                excerpt={poem.excerpt}
                                imgUrl={poem.imgUrl}
                                linkTo={`/read/${poem.id}`}
                                readingTime={poem.readingTime}
                                delay={Math.min(index * 0.1, 0.6)}
                            />
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    )
}
