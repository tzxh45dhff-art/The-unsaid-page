import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'
import useTimeOfDay from '../hooks/useTimeOfDay'

/* ── Time-keyed prompt pools ── */
const promptsByTime = {
    morning: [
        "The first thing you saw today — describe it as if you're seeing it for the last time.",
        "Write about a morning ritual you do without thinking.",
        "What does the quiet before the world wakes up sound like?",
        "Describe the light that enters your room at dawn.",
        "Write about something you promised yourself you'd do today.",
        "What would you say to the person you were at midnight?",
        "Describe the taste of your first sip of the day.",
        "Write a letter to the day ahead, before it begins.",
    ],
    afternoon: [
        "Write about the weight of a Tuesday afternoon.",
        "Describe a conversation you overheard but pretended not to.",
        "What does your desk look like right now? Write it as a crime scene.",
        "Write about the longest pause in a conversation you've had today.",
        "Describe a window you pass every day but never look through.",
        "What would you rather be doing right now? Write about it in third person.",
        "Write about the sound of a clock in an empty room.",
        "Describe the feeling of waiting for something you're not sure will come.",
    ],
    golden: [
        "Capture this exact shade of light before it disappears.",
        "Write about something that looks beautiful only at this hour.",
        "Describe a shadow that's longer than the thing casting it.",
        "What would you say to the sun if it paused right here?",
        "Write about a place that glows differently at golden hour.",
        "Describe a memory that has the same warmth as this light.",
        "Write about the moment just before everything turns amber.",
        "What does nostalgia look like when it's backlit?",
    ],
    evening: [
        "Who do you become when the day is done?",
        "Write about a door you closed today — literally or not.",
        "Describe the sound of your house settling at dusk.",
        "What did today teach you that you didn't ask to learn?",
        "Write about the space between putting down your work and picking up your life.",
        "Describe the color of exhaustion.",
        "Write a eulogy for today.",
        "What would the evening sky say if it read your thoughts?",
    ],
    night: [
        "It's past midnight. Write about something you left behind.",
        "What do you think about when you can't sleep?",
        "Describe a dream you had that felt more real than waking.",
        "Write about a secret you've never told anyone — disguised as fiction.",
        "What lives in the dark corner of your room?",
        "Write about the version of yourself that only exists at night.",
        "Describe the sound of silence when the city finally sleeps.",
        "What would you whisper into the void if you knew it was listening?",
    ],
}

/* ── General / fallback prompts ── */
const generalPrompts = [
    "Write about a door that hasn't been opened in ten years.",
    "Describe the color of a forgotten memory.",
    "What does silence sound like in an empty house?",
    "Write a letter to someone you'll never send it to.",
    "Describe the last dream you remember, but change the ending.",
    "What would you say to the moon if it could listen?",
    "Write about the space between two heartbeats.",
    "Describe a conversation between rain and a tin roof.",
    "What does your childhood bedroom smell like?",
    "Write about something you lost and never looked for.",
    "Describe the longest walk you've ever taken.",
    "What would your shadow say if it could speak?",
    "Write about a book that changed the way you breathe.",
    "Describe the feeling of watching a train leave without you.",
    "What does the word 'home' taste like?",
]

/* ── Daily seed: same prompt for everyone on the same day ── */
function dailySeed() {
    const dateStr = new Date().toDateString()
    let hash = 0
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash << 5) - hash + dateStr.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

/* ── Time-of-day labels ── */
const timeLabels = {
    morning: "This morning's prompt",
    afternoon: "This afternoon's prompt",
    golden: "Golden hour prompt",
    evening: "This evening's prompt",
    night: "Tonight's prompt",
}

export default function WritingPrompts({ onSelectPrompt }) {
    const timeOfDay = useTimeOfDay()
    const pool = promptsByTime[timeOfDay] || generalPrompts

    const dailyIndex = useMemo(() => dailySeed() % pool.length, [pool])

    const [isOpen, setIsOpen] = useState(false)
    const [offset, setOffset] = useState(0) // cycles through pool starting from daily

    const currentPrompt = pool[(dailyIndex + offset) % pool.length]
    const label = timeLabels[timeOfDay] || 'A prompt for you'

    const nextPrompt = () => {
        setOffset((prev) => (prev + 1) % pool.length)
    }

    const handleSelect = () => {
        if (onSelectPrompt) onSelectPrompt(currentPrompt)
    }

    return (
        <div className="writing-prompts-container">
            <button
                className="prompt-trigger btn"
                onClick={() => setIsOpen((o) => !o)}
            >
                <Sparkles size={16} />
                {isOpen ? 'Hide Prompts' : 'Need Inspiration?'}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="prompt-card brutal-card"
                        initial={{ opacity: 0, y: -10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="prompt-time-label">✦ {label}</span>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={offset}
                                className="prompt-text"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                "{currentPrompt}"
                            </motion.p>
                        </AnimatePresence>
                        <div className="prompt-actions">
                            <button className="prompt-next" onClick={nextPrompt}>
                                <RefreshCw size={14} /> Another
                            </button>
                            {onSelectPrompt && (
                                <button className="prompt-use" onClick={handleSelect}>
                                    Use This ↗
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
