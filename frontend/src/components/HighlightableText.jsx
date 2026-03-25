import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'unsaid-highlights'

export default function HighlightableText({ lines, postId }) {
    const [userHighlights, setUserHighlights] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
            return stored[postId] || []
        } catch { return [] }
    })

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
            stored[postId] = userHighlights
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
        } catch { /* ignore */ }
    }, [userHighlights, postId])

    const toggleHighlight = useCallback((index) => {
        setUserHighlights(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }, [])

    return (
        <div className="highlightable-text">
            {lines.map((line, idx) => {
                if (!line) return <div key={idx} className="hl-line-spacer" />

                const isUserHighlighted = userHighlights.includes(idx)

                return (
                    <motion.p
                        key={idx}
                        className={`hl-line ${isUserHighlighted ? 'hl-user' : ''}`}
                        onClick={() => toggleHighlight(idx)}
                        whileHover={{ scale: 1.005 }}
                    >
                        {line}
                    </motion.p>
                )
            })}
        </div>
    )
}
