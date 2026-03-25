import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './PageFlipReader.css'

function splitIntoPages(text, wordsPerPage = 120) {
    const lines = text.split('\n')
    const pages = []
    let currentPage = []
    let wordCount = 0

    for (const line of lines) {
        const lineWords = line.trim() ? line.trim().split(/\s+/).length : 0
        if (wordCount + lineWords > wordsPerPage && currentPage.length > 0) {
            pages.push(currentPage)
            currentPage = []
            wordCount = 0
        }
        currentPage.push(line)
        wordCount += lineWords
    }
    if (currentPage.length > 0) pages.push(currentPage)
    return pages
}

export default function PageFlipReader({ body, fontStyle }) {
    const pages = splitIntoPages(body)
    const [currentPage, setCurrentPage] = useState(0)
    const [direction, setDirection] = useState(0) // -1 = prev, 1 = next

    const goNext = useCallback(() => {
        if (currentPage < pages.length - 1) {
            setDirection(1)
            setCurrentPage(p => p + 1)
        }
    }, [currentPage, pages.length])

    const goPrev = useCallback(() => {
        if (currentPage > 0) {
            setDirection(-1)
            setCurrentPage(p => p - 1)
        }
    }, [currentPage])

    // Arrow key + swipe support
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [goNext, goPrev])

    // Touch support
    const [touchStart, setTouchStart] = useState(null)

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
    const handleTouchEnd = (e) => {
        if (touchStart === null) return
        const diff = touchStart - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) {
            diff > 0 ? goNext() : goPrev()
        }
        setTouchStart(null)
    }

    const variants = {
        enter: (d) => ({
            rotateY: d > 0 ? 90 : -90,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (d) => ({
            rotateY: d > 0 ? -90 : 90,
            opacity: 0,
            scale: 0.95,
        }),
    }

    return (
        <div
            className="page-flip-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="page-flip-stage" style={{ perspective: '1200px' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentPage}
                        className="page-flip-page brutal-card"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            ...fontStyle,
                            transformOrigin: direction > 0 ? 'left center' : 'right center',
                        }}
                    >
                        {pages[currentPage].map((line, i) => (
                            <p key={i} className={line.trim() ? '' : 'page-spacer'}>
                                {line || '\u00A0'}
                            </p>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="page-flip-controls">
                <button
                    className="flip-btn"
                    onClick={goPrev}
                    disabled={currentPage === 0}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">
                    {currentPage + 1} / {pages.length}
                </span>
                <button
                    className="flip-btn"
                    onClick={goNext}
                    disabled={currentPage === pages.length - 1}
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    )
}
