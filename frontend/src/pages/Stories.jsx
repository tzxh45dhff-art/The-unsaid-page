import { motion } from 'framer-motion'
import Card from '../components/Card'
import { useState, useMemo } from 'react'

import { useFetch } from '../hooks/useFetch'
import { fetchPostsList } from '../data/mockApi'
import { CardSkeleton } from '../components/Skeleton'
import './Stories.css'

export default function Stories() {
    const [query, setQuery] = useState('')
    const [tag, setTag] = useState('')
    const [mood, setMood] = useState('')

    const moods = useMemo(() => [
        'quiet', 'healing', 'heartbreak', 'late-night',
        'nostalgic', 'joyful', 'melancholic', 'dreamy',
        'romantic', 'angry', 'hopeful', 'reflective'
    ], [])

    const { data: storiesList, loading } = useFetch(fetchPostsList, 'Story', { query, tag, mood })

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container stories-page"
        >
            <header className="stories-header">
                <h1>Stories</h1>
                <div className="section-line"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>
                    Short fiction and personal reflections.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search stories..."
                        className="brutal-input"
                        style={{ maxWidth: '260px' }}
                    />
                    <select value={mood} onChange={(e) => setMood(e.target.value)} className="brutal-input" style={{ maxWidth: '180px' }}>
                        <option value="">All moods</option>
                        {moods.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Tag (e.g. nostalgia)"
                        className="brutal-input"
                        style={{ maxWidth: '180px' }}
                    />
                </div>
            </header>

            <div className="stories-grid">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} style={{ height: '450px' }}>
                            <CardSkeleton />
                        </div>
                    ))
                ) : (
                    storiesList?.map((story, index) => (
                        <div key={story.id} style={{ height: '100%' }}>
                            <Card
                                tag="Story"
                                title={story.title}
                                author={story.author}
                                excerpt={story.excerpt}
                                imgUrl={story.imgUrl}
                                linkTo={`/read/${story.id}`}
                                readingTime={story.readingTime}
                                delay={Math.min(index * 0.1, 0.6)}
                            />
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    )
}
