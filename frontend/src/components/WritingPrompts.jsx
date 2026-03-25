import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'

const prompts = [
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
    "Write about a stranger who smiled at you once.",
    "Describe a sunset to someone who has never seen one.",
    "What would you plant in a garden of regrets?",
    "Write about the weight of an unspoken apology.",
    "Describe the sound of someone falling out of love.",
    "What lives in the pause before someone says goodbye?",
    "Write about a city you've never visited but dream of.",
    "Describe the texture of loneliness on a Sunday afternoon.",
    "What would you tell your younger self in exactly one sentence?",
    "Write about an object that holds more memories than photographs.",
    "Describe what courage looks like at 3 AM.",
    "What does the ocean know that we don't?",
    "Write about a promise you made to yourself and kept.",
    "Describe the difference between being alone and being lonely.",
    "What would the wind write if it had a pen?",
    "Write about the last page of a book no one has read.",
    "Describe a place where time moves differently.",
    "What does forgiveness feel like in your body?",
    "Write about a song that makes you feel homesick.",
    "Describe the first snow you ever saw, real or imagined.",
    "What grows in the cracks of a broken heart?",
    "Write about waiting — not for anything, just waiting.",
    "Describe a love that was quiet and never announced itself.",
    "What would you title your autobiography?",
    "Write about the moment just before dawn.",
]

export default function WritingPrompts() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(() =>
        Math.floor(Math.random() * prompts.length)
    )

    const nextPrompt = () => {
        setCurrentIndex((prev) => (prev + 1) % prompts.length)
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
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentIndex}
                                className="prompt-text"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                "{prompts[currentIndex]}"
                            </motion.p>
                        </AnimatePresence>
                        <button className="prompt-next" onClick={nextPrompt}>
                            <RefreshCw size={14} /> Another
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
