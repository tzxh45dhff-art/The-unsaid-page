import { motion } from 'framer-motion';

/**
 * RevealParagraph — a paragraph (or break) that fades in and slides up
 * as the user scrolls it into the viewport.
 *
 * @param {string|null} text — the paragraph text (null renders a <br>)
 * @param {number} index — used for stagger delay
 */
export default function RevealParagraph({ text, index = 0 }) {
    if (!text) return <br />;

    return (
        <motion.p
            initial={{ opacity: 0.35, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: 0.6,
                delay: Math.min(index * 0.04, 0.2),
                ease: 'easeOut',
            }}
        >
            {text}
        </motion.p>
    );
}
