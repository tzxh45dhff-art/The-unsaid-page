import { useState, useEffect, useRef } from 'react';

const SHELF_KEY = 'unsaid-reading-shelf';

// Load from localStorage once (used as initial state)
function loadShelf() {
    try {
        const stored = localStorage.getItem(SHELF_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse shelf data', e);
    }
    return {};
}

export function useReadingProgress() {
    // Initialize state directly from localStorage — no race condition
    const [shelfBooks, setShelfBooks] = useState(loadShelf);
    const isInitialized = useRef(false);

    // Save on change — but skip the very first render
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            return;
        }
        localStorage.setItem(SHELF_KEY, JSON.stringify(shelfBooks));
    }, [shelfBooks]);

    // Update progress (e.g. while flipping pages)
    const updateProgress = (book, page, totalPages) => {
        setShelfBooks(prev => {
            const existing = prev[book.id] || {};
            return {
                ...prev,
                [book.id]: {
                    ...book,
                    currentPage: page,
                    totalPages: totalPages,
                    lastRead: new Date().toISOString(),
                    bookmarkedPage: existing.bookmarkedPage || 0 // Preserve bookmark
                }
            };
        });
    };

    // Explicitly toggle a bookmark
    const toggleBookmark = (book, page) => {
        setShelfBooks(prev => {
            const existing = prev[book.id];
            // If the book isn't on the shelf yet, add it with the bookmark
            const updatedBook = existing || {
                ...book,
                currentPage: page,
                lastRead: new Date().toISOString()
            };

            const isBookmarking = updatedBook.bookmarkedPage !== page;

            return {
                ...prev,
                [book.id]: {
                    ...updatedBook,
                    bookmarkedPage: isBookmarking ? page : 0 // 0 means no active bookmark
                }
            };
        });
    };

    // Remove from shelf
    const removeFromShelf = (bookId) => {
        setShelfBooks(prev => {
            const next = { ...prev };
            delete next[bookId];
            return next;
        });
    };

    // Get array of books, sorted by most recently read
    const getShelfArray = () => {
        return Object.values(shelfBooks).sort((a, b) => {
            return new Date(b.lastRead) - new Date(a.lastRead);
        });
    };

    return {
        shelfBooks,
        shelfArray: getShelfArray(),
        updateProgress,
        toggleBookmark,
        removeFromShelf
    };
}
