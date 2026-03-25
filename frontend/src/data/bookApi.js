import axios from 'axios'
import api from '../api/apiClient'

// ── Search Gutenberg Books ──
export async function searchBooks(query, limit = 20) {
    if (!query) return []
    try {
        const { data } = await axios.get('https://gutendex.com/books/', {
            params: { search: query }
        })
        
        return (data.results || []).slice(0, limit).map(book => {
            // Find a cover image (usually image/jpeg)
            const coverUrl = book.formats['image/jpeg'] || null
            
            // Find a readable format (prefer HTML over plain text)
            let readUrl = null
            let formatType = null
            
            const plainKey = Object.keys(book.formats || {}).find(k => k.startsWith('text/plain'))
            const htmlKey = Object.keys(book.formats || {}).find(k => k.startsWith('text/html'))

            if (plainKey) {
                readUrl = book.formats[plainKey]
                formatType = 'text'
            } else if (htmlKey) {
                readUrl = book.formats[htmlKey]
                formatType = 'html'
            }
            
            return {
                id: book.id,
                title: book.title,
                author: book.authors?.[0]?.name || 'Unknown',
                year: book.birth_year ? `${book.birth_year}` : '',
                coverUrl: coverUrl,
                subjects: book.subjects?.slice(0, 5) || [],
                downloads: book.download_count,
                readUrl: readUrl,
                formatType: formatType
            }
        })
    } catch (err) {
        console.error('Gutenberg search failed:', err)
        return []
    }
}

// ── Get Book Details ──
// Gutendex includes everything in the search, but if we need a direct fetch:
export async function getBookDetails(id) {
    try {
        const { data } = await axios.get(`https://gutendex.com/books/${id}`)
        return data
    } catch (err) {
        console.error('Book details fetch failed:', err)
        return null
    }
}

// ── Fetch Book Text ──
// Fetches the actual raw html or text of the book
// Uses our own backend proxy first to avoid CORS, then allorigins as fallback
export async function fetchBookContent(url) {
    if (!url) return null

    // 1️⃣ Try our own backend proxy (no CORS issues)
    try {
        const { data } = await api.get('/proxy', { params: { url } })
        if (data?.text) return data.text
        if (typeof data === 'string') return data
    } catch (err) {
        console.warn('Backend proxy failed, trying allorigins:', err.message)
    }

    // 2️⃣ Fallback: allorigins CORS proxy
    try {
        const { data } = await axios.get(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
        return data
    } catch (err2) {
        console.warn('allorigins failed, trying direct fetch:', err2.message)
    }

    // 3️⃣ Last resort: direct fetch (will fail if CORS blocked)
    try {
        const { data } = await axios.get(url)
        return data
    } catch (err3) {
        console.error('All fetch methods failed for:', url)
        return "Failed to load book content. The server might be blocking the request."
    }
}

// ── Gutenberg Staff Picks ──
export const staffPicks = [
    { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/1342.txt.utf-8', formatType: 'text' },
    { id: 11, title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll', coverUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/11.txt.utf-8', formatType: 'text' },
    { id: 84, title: 'Frankenstein', author: 'Mary Wollstonecraft Shelley', coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/84.txt.utf-8', formatType: 'text' },
    { id: 1661, title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/1661.txt.utf-8', formatType: 'text' },
    { id: 2701, title: 'Moby Dick', author: 'Herman Melville', coverUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/2701.txt.utf-8', formatType: 'text' },
    { id: 46, title: 'A Christmas Carol', author: 'Charles Dickens', coverUrl: 'https://www.gutenberg.org/cache/epub/46/pg46.cover.medium.jpg', readUrl: 'https://www.gutenberg.org/ebooks/46.txt.utf-8', formatType: 'text' },
]

// ── Search LibriVox audiobooks ──
export async function searchAudiobooks(title) {
    try {
        const { data } = await axios.get('https://librivox.org/api/feed/audiobooks', {
            params: {
                title: title,
                format: 'json',
                limit: 5,
            }
        })
        return (data.books || []).map(book => ({
            id: book.id,
            title: book.title,
            author: book.authors?.[0]?.first_name + ' ' + book.authors?.[0]?.last_name,
            url: book.url_librivox,
            rssUrl: book.url_rss,
            totalTime: book.totaltime,
            language: book.language,
        }))
    } catch {
        return []
    }
}

// ── Browser Text-to-Speech ──
export function readAloud(text, onEnd) {
    if (!('speechSynthesis' in window)) return false

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.lang = 'en-US'

    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
    return true
}

export function stopReadAloud() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
