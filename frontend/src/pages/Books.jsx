import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Headphones, Volume2, VolumeX, BookText, Star, Bookmark, BookmarkCheck } from 'lucide-react'
import { searchBooks, staffPicks, searchAudiobooks, readAloud, stopReadAloud, fetchBookContent } from '../data/bookApi'
import { useSearchParams } from 'react-router-dom'
import { useReadingProgress } from '../hooks/useReadingProgress'
import HTMLFlipBook from 'react-pageflip'
import axios from 'axios'
import './Books.css'

function BookCard({ book, onSelect }) {
    return (
        <motion.div
            className="book-card brutal-card"
            whileHover={{ y: -6, boxShadow: 'var(--glass-shadow-hover)' }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(book)}
            layout
        >
            <div className="book-cover-wrap">
                {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} loading="lazy" className="book-cover" />
                ) : (
                    <div className="book-cover-placeholder">
                        <BookOpen size={32} />
                    </div>
                )}
            </div>
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                {book.year && <span className="book-year">Born: {book.year}</span>}
                {book.downloads && <span className="book-downloads">{book.downloads.toLocaleString()} downloads</span>}
            </div>
        </motion.div>
    )
}

function FlipbookReader({ book, onClose, initialPage = 0 }) {
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)
    const containerRef = useRef(null)
    const flipBookRef = useRef(null)
    const [bookSize, setBookSize] = useState({ width: 450, height: 600 })

    const { shelfBooks, updateProgress, toggleBookmark } = useReadingProgress()
    const [currentPage, setCurrentPage] = useState(initialPage)

    const shelfBook = shelfBooks[book.id]
    const isBookmarked = shelfBook?.bookmarkedPage === currentPage

    const onFlip = (e) => {
        setCurrentPage(e.data)
        // Add 3 to account for cover pages
        updateProgress(book, e.data, pages.length + 3)
    }

    const handleBookmark = () => {
        toggleBookmark(book, currentPage)
    }

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const text = await fetchBookContent(book.readUrl)
                if (typeof text !== 'string') throw new Error("Could not parse book text")
                
                const paragraphs = text.split('\n')
                const parsedPages = []
                let currentPage = ""
                
                for(let p of paragraphs) {
                    if (currentPage.length + p.length > 800) {
                        if (currentPage.trim()) parsedPages.push(currentPage)
                        currentPage = p + "\n"
                    } else {
                        currentPage += p + "\n"
                    }
                }
                if (currentPage.trim()) parsedPages.push(currentPage)
                
                setPages(parsedPages)
            } catch(e) {
                console.error('Failed to load text for flipbook', e)
            } finally {
                setLoading(false)
            }
        }
        fetchBook()
    }, [book])

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const h = Math.floor(rect.height - 40)
                const w = Math.floor(h * 0.7)
                setBookSize({ width: Math.min(w, 500), height: Math.min(h, 750) })
            }
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [loading])

    return (
        <div className="book-reader-modal flipbook-wrapper">
            <div className="reader-header reader-header-small" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <h2 style={{ flex: 1 }}>{book.title}</h2>
                {!loading && (
                    <button 
                        className="btn" 
                        onClick={handleBookmark} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: isBookmarked ? 'var(--warm-gold)' : '', color: isBookmarked ? 'var(--warm-gold)' : '' }}
                    >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        {isBookmarked ? 'Bookmarked' : 'Bookmark Page'}
                    </button>
                )}
                <button className="btn close-btn-small" onClick={onClose}>Close</button>
            </div>
            {loading ? (
                <div className="flipbook-loading">Opening Book...</div>
            ) : (
                <div className="flipbook-container" ref={containerRef}>
                    <HTMLFlipBook 
                        ref={flipBookRef}
                        width={bookSize.width} 
                        height={bookSize.height} 
                        size="fixed" 
                        maxShadowOpacity={0.5} 
                        showCover={true} 
                        mobileScrollSupport={true} 
                        className="flipbook"
                        startPage={initialPage}
                        onFlip={onFlip}
                    >
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content cover-content" style={{ padding: 0 }}>
                                {book.coverUrl ? (
                                    <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                                ) : (
                                    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <h2>{book.title}</h2>
                                        <h3>{book.author}</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="page page-inner-cover" data-density="hard">
                            <div className="page-content" style={{ backgroundColor: '#fdfaf3' }}></div>
                        </div>
                        {pages.map((p, i) => (
                            <div key={i} className="page page-text">
                                <div className="page-content">
                                    {p.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                                </div>
                                <div className="page-footer">{i + 1}</div>
                            </div>
                        ))}
                        <div className="page page-inner-cover" data-density="hard">
                            <div className="page-content" style={{ backgroundColor: '#fdfaf3' }}></div>
                        </div>
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content cover-content">
                                <h3>The End</h3>
                            </div>
                        </div>
                    </HTMLFlipBook>
                </div>
            )}
        </div>
    )
}

function BookDetailModal({ book, onClose }) {
    const [audiobooks, setAudiobooks] = useState([])
    const [reading, setReading] = useState(false)
    const [loadingAudio, setLoadingAudio] = useState(true)
    const [isReadMode, setIsReadMode] = useState(book.autoStart || false)
    const { shelfBooks } = useReadingProgress()

    useEffect(() => {
        if (!book) return
        setLoadingAudio(true)
        searchAudiobooks(book.title).then(r => {
            setAudiobooks(r)
            setLoadingAudio(false)
        })
    }, [book])

    const handleReadAloud = () => {
        if (reading) {
            stopReadAloud()
            setReading(false)
        } else {
            const text = `${book.title} by ${book.author}. Subjects involve ${book.subjects?.join(', ')}.`
            readAloud(text, () => setReading(false))
            setReading(true)
        }
    }

    useEffect(() => {
        return () => stopReadAloud()
    }, [])

    if (!book) return null

    if (isReadMode && book.readUrl) {
        return (
            <motion.div
                className="book-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {book.formatType === 'html' ? (
                    <div className="book-reader-modal">
                        <div className="reader-header">
                            <h2>{book.title}</h2>
                            <button className="btn" onClick={() => setIsReadMode(false)}>Close Reader</button>
                        </div>
                        <iframe src={book.readUrl} className="reader-iframe" title={book.title} />
                    </div>
                ) : (
                    <FlipbookReader book={book} onClose={() => setIsReadMode(false)} initialPage={shelfBooks[book.id]?.bookmarkedPage > 0 ? shelfBooks[book.id].bookmarkedPage : (shelfBooks[book.id]?.currentPage || 0)} />
                )}
            </motion.div>
        )
    }

    return (
        <motion.div
            className="book-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="book-modal brutal-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-content">
                    <div className="modal-cover">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} />
                        ) : (
                            <div className="book-cover-placeholder large"><BookOpen size={48} /></div>
                        )}
                    </div>
                    <div className="modal-info">
                        <h2>{book.title}</h2>
                        <p className="modal-author">by {book.author}</p>
                        {book.year && <span className="book-year">Author born: {book.year}</span>}

                        {book.subjects?.length > 0 && (
                            <div className="modal-subjects" style={{ marginTop: '1rem' }}>
                                <strong>Subjects: </strong>
                                {book.subjects.map((s, i) => (
                                    <span key={i} className="subject-tag">{s}</span>
                                ))}
                            </div>
                        )}

                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            {book.readUrl && (
                                <button className="btn btn-primary" onClick={() => setIsReadMode(true)}>
                                    <BookText size={16} /> Read Book Now
                                </button>
                            )}

                            <button className="btn" onClick={handleReadAloud}>
                                {reading ? <><VolumeX size={16} /> Stop Siri</> : <><Volume2 size={16} /> Read Info</>}
                            </button>

                            {loadingAudio ? (
                                <span className="audio-status">Checking audiobooks...</span>
                            ) : audiobooks.length > 0 ? (
                                <a href={audiobooks[0].url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                    <Headphones size={16} /> Listen on LibriVox
                                    {audiobooks[0].totalTime && <span className="audio-time">({audiobooks[0].totalTime})</span>}
                                </a>
                            ) : (
                                <span className="audio-status">No free audiobook found</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function Books() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const inputRef = useRef(null)

    const [searchParams, setSearchParams] = useSearchParams()
    const openId = searchParams.get('open')
    const { shelfBooks } = useReadingProgress()

    useEffect(() => {
        if (openId && shelfBooks[openId] && !selectedBook) {
            setSelectedBook({ ...shelfBooks[openId], autoStart: true })
            const nextParams = new URLSearchParams(searchParams)
            nextParams.delete('open')
            setSearchParams(nextParams, { replace: true })
        }
    }, [openId, shelfBooks, searchParams, setSearchParams, selectedBook])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setSearching(true)
        const books = await searchBooks(query)
        setResults(books)
        setSearching(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container books-container"
        >
            <header className="books-header">
                <h1>Books & <span className="title-accent">Audiobooks</span></h1>
                <div className="section-line" />
                <p>Discover public domain classics, read them natively, or listen to free audiobooks.</p>
            </header>

            <form className="books-search" onSubmit={handleSearch}>
                <div className="search-input-wrap">
                    <Search size={18} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search Gutenberg by title or author..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="brutal-input search-input"
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={searching}>
                    {searching ? 'Searching Gutenberg...' : 'Search'}
                </button>
            </form>

            {/* Search Results */}
            {results.length > 0 && (
                <section className="books-section">
                    <h2>Search Results</h2>
                    <div className="section-line" style={{ marginBottom: '2rem' }} />
                    <div className="books-grid">
                        {results.map(book => (
                            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
                        ))}
                    </div>
                </section>
            )}

            {/* Staff Picks */}
            <section className="books-section">
                <h2><Star size={20} style={{ marginRight: '0.5rem', color: 'var(--warm-gold)' }} /> Literary Classics</h2>
                <div className="section-line" style={{ marginBottom: '2rem' }} />
                <div className="books-grid">
                    {staffPicks.map(book => (
                        <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
                    ))}
                </div>
            </section>

            <AnimatePresence>
                {selectedBook && (
                    <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
