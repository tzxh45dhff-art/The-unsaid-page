import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import './Bookshelf.css';

export default function Bookshelf({ books, onRemove }) {
    const navigate = useNavigate();
    const [animatingId, setAnimatingId] = useState(null);

    const handleOpenBook = (book) => {
        if (animatingId) return;
        setAnimatingId(book.id);
        
        // Wait for the animation to complete before navigating
        setTimeout(() => {
            navigate(`/books?open=${book.id}`);
        }, 1400); // Increased timing for the much bolder animation
    };

    if (!books || books.length === 0) return null;

    // Chunk books into shelves of up to 5 books to simulate physical shelves
    const shelves = [];
    const booksPerShelf = 5;
    for (let i = 0; i < Math.max(books.length, booksPerShelf); i += booksPerShelf) {
        shelves.push(books.slice(i, i + booksPerShelf));
    }

    return (
        <div className="bookshelf-container">
            <div className="bookshelf-cabinet">
                {shelves.map((shelf, shelfIdx) => (
                    <div className="bookshelf-shelf" key={`shelf-${shelfIdx}`}>
                        <div className="shelf-books">
                            <AnimatePresence>
                                {shelf.map(book => (
                                    <motion.div
                                        key={book.id}
                                        layoutId={`book-${book.id}`}
                                        className={`shelf-book ${animatingId === book.id ? 'is-opening' : ''}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    >   
                                        {/* Overlay block to darken the cabinet when expanding */}
                                        {animatingId === book.id && <div className="book-focus-overlay" />}
                                        
                                        <div className="book-3d-wrapper" onClick={() => handleOpenBook(book)}>
                                            <div className="book-front">
                                                {book.coverUrl ? (
                                                    <img src={book.coverUrl} alt={book.title} className="shelf-cover-img" />
                                                ) : (
                                                    <div className="shelf-cover-placeholder">
                                                        <span className="placeholder-title">{book.title}</span>
                                                    </div>
                                                )}
                                                {book.bookmarkedPage > 0 && (
                                                    <div className="shelf-bookmark-ribbon" title={`Bookmarked on page ${book.bookmarkedPage}`}>
                                                        <Bookmark size={20} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="book-spine">
                                                <span className="spine-title">{book.title}</span>
                                            </div>
                                            <div className="book-shadow"></div>
                                        </div>
                                        {animatingId !== book.id && (
                                            <>
                                                <button 
                                                    className="remove-book-btn" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onRemove) onRemove(book.id);
                                                    }}
                                                    title="Remove from Shelf"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <div className="book-progress-label">
                                                    {book.bookmarkedPage > 0 ? `Pg ${book.bookmarkedPage}` : (book.currentPage ? `Pg ${book.currentPage}` : 'Reading')}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
