import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SentimentGauge.css'

/*
 * SentimentGauge — real-time mood aura ring.
 *
 * Layer 1: Fast local keyword map (instant feedback while typing)
 * Layer 2: Debounced Groq API call for deeper sentiment analysis
 *
 * The aura is a pulsing ring whose color and label transition
 * smoothly via Framer Motion.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// ── Keyword → mood map for instant local analysis ──
const KEYWORD_MAP = {
    // Melancholy / Sadness — blue
    dark:    'melancholy', lost:     'melancholy', alone:   'melancholy',
    cold:    'melancholy', hollow:   'melancholy', empty:   'melancholy',
    rain:    'melancholy', tears:    'melancholy', broken:  'melancholy',
    shadow:  'melancholy', grief:    'melancholy', sorrow:  'melancholy',
    cry:     'melancholy', drown:    'melancholy', fading:  'melancholy',
    // Hope / Warmth — gold
    hope:    'hope',   light:   'hope',   dawn:    'hope',
    warm:    'hope',   bloom:   'hope',   rise:    'hope',
    sun:     'hope',   gentle:  'hope',   dream:   'hope',
    heal:    'hope',   peace:   'hope',   golden:  'hope',
    // Anger / Passion — red
    angry:   'passion', fire:    'passion', burn:    'passion',
    rage:    'passion', blood:   'passion', violent: 'passion',
    storm:   'passion', fury:    'passion', scream:  'passion',
    // Romance / Love — pink/rose
    love:    'romance', kiss:    'romance', heart:   'romance',
    tender:  'romance', rose:    'romance', sweet:   'romance',
    desire:  'romance', embrace: 'romance', beloved: 'romance',
    // Mystery / Ethereal — purple
    void:    'mystery', night:   'mystery', star:    'mystery',
    cosmos:  'mystery', silence: 'mystery', ghost:   'mystery',
    mist:    'mystery', whisper: 'mystery', secret:  'mystery',
    // Joy / Energy — green/teal
    joy:     'joy',  laugh:  'joy',  dance:  'joy',
    bright:  'joy',  alive:  'joy',  free:   'joy',
    sing:    'joy',  play:   'joy',  spark:  'joy',
}

const MOOD_CONFIG = {
    neutral:   { color: 'rgba(201, 149, 107, 0.6)', glow: 'rgba(201, 149, 107, 0.15)', label: 'Waiting…',    emoji: '🕯️' },
    melancholy:{ color: 'rgba(100, 149, 237, 0.8)', glow: 'rgba(100, 149, 237, 0.2)',  label: 'Melancholy',  emoji: '🌧️' },
    hope:      { color: 'rgba(218, 175, 120, 0.9)', glow: 'rgba(218, 175, 120, 0.25)', label: 'Hopeful',     emoji: '🌅' },
    passion:   { color: 'rgba(220, 80, 60, 0.85)',  glow: 'rgba(220, 80, 60, 0.2)',    label: 'Passionate',  emoji: '🔥' },
    romance:   { color: 'rgba(219, 112, 147, 0.8)', glow: 'rgba(219, 112, 147, 0.2)',  label: 'Romantic',    emoji: '🌹' },
    mystery:   { color: 'rgba(147, 112, 219, 0.8)', glow: 'rgba(147, 112, 219, 0.2)',  label: 'Ethereal',    emoji: '🌌' },
    joy:       { color: 'rgba(72, 209, 176, 0.85)', glow: 'rgba(72, 209, 176, 0.2)',   label: 'Joyful',      emoji: '✨' },
}

// Fast local analysis
function analyzeLocally(text) {
    if (!text || text.length < 5) return 'neutral'
    const words = text.toLowerCase().split(/\W+/)
    const counts = {}
    for (const w of words) {
        const mood = KEYWORD_MAP[w]
        if (mood) counts[mood] = (counts[mood] || 0) + 1
    }
    const entries = Object.entries(counts)
    if (entries.length === 0) return 'neutral'
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
}

// Deep Groq analysis (debounced)
async function analyzeWithGroq(text) {
    if (!GROQ_API_KEY || !text || text.length < 20) return null
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `You are a sentiment analyzer. Given a piece of creative writing, classify its dominant mood as exactly ONE of these words: melancholy, hope, passion, romance, mystery, joy, neutral. Respond with ONLY the single word, nothing else.`,
                    },
                    { role: 'user', content: text.slice(0, 500) },
                ],
                temperature: 0,
                max_tokens: 10,
            }),
        })
        if (!res.ok) return null
        const data = await res.json()
        const mood = data.choices?.[0]?.message?.content?.trim().toLowerCase()
        return MOOD_CONFIG[mood] ? mood : null
    } catch {
        return null
    }
}

function SentimentGauge({ text = '', onMoodDetected }) {
    const [mood, setMood] = useState('neutral')
    const [groqMood, setGroqMood] = useState(null)
    const groqTimer = useRef(null)
    const lastGroqText = useRef('')

    // Instant local analysis on every keystroke
    useEffect(() => {
        const local = analyzeLocally(text)
        // Prefer Groq result if we have one and text hasn't diverged
        setMood(groqMood || local)
    }, [text, groqMood])

    // Debounced Groq analysis — fires 1.5s after the user stops typing
    useEffect(() => {
        if (groqTimer.current) clearTimeout(groqTimer.current)
        if (text.length < 20) { setGroqMood(null); return }

        groqTimer.current = setTimeout(async () => {
            // Don't re-analyze same text
            if (text === lastGroqText.current) return
            lastGroqText.current = text
            const result = await analyzeWithGroq(text)
            if (result) setGroqMood(result)
        }, 1500)

        return () => clearTimeout(groqTimer.current)
    }, [text])

    // Notify parent of mood changes
    useEffect(() => {
        if (onMoodDetected) {
            onMoodDetected(mood)
        }
    }, [mood, onMoodDetected])

    const config = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral

    return (
        <div className="sentiment-gauge" aria-label={`Current mood: ${config.label}`}>
            {/* Outer glow ring */}
            <motion.div
                className="sentiment-aura-ring"
                animate={{
                    boxShadow: `0 0 20px 8px ${config.glow}, inset 0 0 15px 4px ${config.glow}`,
                    borderColor: config.color,
                    scale: [1, 1.06, 1],
                }}
                transition={{
                    boxShadow: { duration: 0.8, ease: 'easeInOut' },
                    borderColor: { duration: 0.8, ease: 'easeInOut' },
                    scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                }}
            >
                {/* Inner core */}
                <motion.div
                    className="sentiment-aura-core"
                    animate={{
                        background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                    }}
                    transition={{ duration: 0.8 }}
                />
            </motion.div>

            {/* Label */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={mood}
                    className="sentiment-label"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="sentiment-emoji">{config.emoji}</span>
                    <span className="sentiment-text">{config.label}</span>
                    {groqMood && <span className="sentiment-ai-badge">AI</span>}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default memo(SentimentGauge)
