export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--card-border)',
            padding: '2rem 0',
            marginTop: 'auto',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            letterSpacing: '0.05em'
        }}>
            <div className="container">
                &copy; {new Date().getFullYear()} The Unsaid Page. A sanctuary for words.
            </div>
        </footer>
    )
}
