import { motion, AnimatePresence } from 'framer-motion';
import './VoidAnimation.css';

/**
 * VoidAnimation — wraps children and collapses them into a singularity on trigger.
 *
 * @param {boolean} trigger — when true, the void animation plays
 * @param {function} onComplete — called after the collapse animation finishes
 * @param {React.ReactNode} children — the content to animate
 */
export default function VoidAnimation({ trigger, onComplete, children }) {
    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" onExitComplete={onComplete}>
                {!trigger && (
                    <motion.div
                        key="void-content"
                        initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                            filter: 'blur(12px)',
                            rotate: -8,
                            transition: {
                                duration: 0.7,
                                ease: [0.65, 0, 0.35, 1], // cubic-bezier
                            },
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Void pulse ring */}
            <AnimatePresence>
                {trigger && (
                    <motion.div
                        className="void-pulse"
                        initial={{ width: 0, height: 0, opacity: 0.8 }}
                        animate={{
                            width: 600,
                            height: 600,
                            opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
