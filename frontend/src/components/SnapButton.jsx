import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { toggleSnap } from '../api/posts';

export default function SnapButton({ postId }) {
    const [snapped, setSnapped] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useUser();

    const handleSnap = async () => {
        if (!isAuthenticated || !postId) {
            // Optimistic local-only snap for unauthenticated users
            setSnapped(true);
            return;
        }
        try {
            setLoading(true);
            const result = await toggleSnap(postId);
            setSnapped(result.snapped);
        } catch {
            // Fallback to local state
            setSnapped(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSnap}
                className={`btn ${snapped ? 'btn-primary' : ''}`}
                style={{ position: 'relative', zIndex: 2 }}
                disabled={snapped || loading}
            >
                <Sparkles size={18} /> {snapped ? 'Snapped!' : loading ? 'Snapping...' : 'Snap to appreciate'}
            </motion.button>
            <AnimatePresence>
                {snapped && (
                    <motion.div
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '40px',
                            height: '40px',
                            marginLeft: '-20px',
                            marginTop: '-20px',
                            borderRadius: '50%',
                            border: '4px solid var(--accent-color)',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
