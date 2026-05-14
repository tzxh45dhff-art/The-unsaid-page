import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InkSplash.css'

/*
 * InkSplash — renders fading ink circles at approximate cursor position.
 *
 * Usage:
 *   Keep a state array of splash objects { id, x, y } and pass it in.
 *   When each splash finishes animating, onRemove(id) is called to
 *   clean it up from the parent state — keeping the DOM lean.
 *
 *   Splashes auto-expire after 600ms via Framer Motion.
 */

function InkSplash({ splashes = [], onRemove }) {
    return (
        <div className="ink-splash-layer" aria-hidden="true">
            <AnimatePresence>
                {splashes.map((s) => (
                    <motion.div
                        key={s.id}
                        className="ink-splash"
                        style={{ left: s.x, top: s.y }}
                        initial={{ scale: 0, opacity: 0.7 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        onAnimationComplete={() => onRemove?.(s.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

export default memo(InkSplash)
