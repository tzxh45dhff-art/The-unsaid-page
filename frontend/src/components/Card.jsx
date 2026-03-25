import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCachedSummary } from '../data/groqApi'
import './Card.css'

export default function Card({ title, excerpt, imgUrl, linkTo, tag, readingTime, author, delay = 0, id }) {
    const navigate = useNavigate()
    const [aiSummary, setAiSummary] = useState(null)

    useEffect(() => {
        if (!title || !excerpt) return
        const cardId = id || linkTo?.replace('/read/', '') || title
        getCachedSummary(cardId, title, excerpt, author).then(s => {
            if (s) setAiSummary(s)
        })
    }, [title, excerpt, author, id, linkTo])

    const handleCardClick = (e) => {
        // Don't navigate if user is selecting text
        if (window.getSelection()?.toString()) return
        navigate(linkTo)
    }

    return (
        <motion.article
            className="brutal-card article-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(delay, 0.4) }}
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            {imgUrl && (
                <div className="card-image-wrapper">
                    <img src={imgUrl} alt={title} loading="lazy" />
                    <div className="tag-group" style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {tag && <span className="card-tag" style={{ position: 'static' }}>{tag}</span>}
                        {readingTime && <span className="card-tag reading-time-badge" style={{ position: 'static', backgroundColor: 'var(--brutal-yellow)', color: '#111' }}>{readingTime}</span>}
                    </div>
                </div>
            )}

            <div className="card-content">
                {!imgUrl && (
                    <div className="tag-group-text" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {tag && <span className="card-tag text-only-tag" style={{ position: 'static', marginBottom: 0 }}>{tag}</span>}
                        {readingTime && <span className="card-tag reading-time-badge" style={{ position: 'static', marginBottom: 0, backgroundColor: 'var(--brutal-yellow)', color: '#111' }}>{readingTime}</span>}
                    </div>
                )}
                <h3>{title}</h3>
                {author && <p className="card-author-name">{author}</p>}

                {aiSummary ? (
                    <p className="card-ai-summary">
                        <Sparkles size={12} className="ai-icon" />
                        {aiSummary}
                    </p>
                ) : (
                    <p>{excerpt}</p>
                )}

                <span className="read-more">
                    Read More <ArrowRight size={16} />
                </span>
            </div>
        </motion.article>
    )
}
