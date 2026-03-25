import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import './PaperPlaneShare.css'

export default function PaperPlaneShare({ title }) {
    const [folding, setFolding] = useState(false)
    const [copied, setCopied] = useState(false)
    const containerRef = useRef(null)

    const handleShare = async () => {
        if (folding) return

        // Copy link to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href)
        } catch {
            const ta = document.createElement('textarea')
            ta.value = window.location.href
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
        }

        setFolding(true)

        // After the fold+fly animation completes, show toast
        setTimeout(() => {
            setCopied(true)
        }, 2000)

        setTimeout(() => {
            setFolding(false)
            setCopied(false)
        }, 4500)
    }

    return (
        <>
            <motion.button
                className="paper-plane-btn btn"
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Send size={16} />
                Share
            </motion.button>

            {/* Full-page fold overlay */}
            <AnimatePresence>
                {folding && (
                    <motion.div
                        className="fullpage-fold-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="fold-page"
                            initial={{
                                rotateX: 0,
                                rotateY: 0,
                                rotateZ: 0,
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                x: 0,
                            }}
                            animate={{
                                rotateX: [0, 15, 30, 10, 0],
                                rotateY: [0, 0, 45, 60, 75],
                                rotateZ: [0, 0, -5, -15, -35],
                                scale: [1, 0.85, 0.6, 0.35, 0.15],
                                opacity: [1, 1, 0.9, 0.7, 0],
                                y: [0, 0, -50, -200, -500],
                                x: [0, 0, 30, 100, 300],
                            }}
                            transition={{
                                duration: 2,
                                ease: [0.25, 0.1, 0.25, 1],
                                times: [0, 0.2, 0.5, 0.75, 1],
                            }}
                        >
                            {/* Fold lines visual */}
                            <div className="fold-content">
                                <div className="fold-line fold-line-1" />
                                <div className="fold-line fold-line-2" />
                                <div className="fold-text">{title || 'The Unsaid Page'}</div>
                                <div className="fold-line fold-line-3" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Copied toast */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        className="share-toast"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        ✈ Link copied to clipboard
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
