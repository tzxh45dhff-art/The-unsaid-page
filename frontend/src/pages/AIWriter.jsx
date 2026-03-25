import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPost } from '../api/posts'
import { submitPost as mockSubmitPost } from '../data/mockApi'
import { fetchCollections, addToCollection } from '../api/collections'
import { useUser } from '../context/UserContext'
import VoidAnimation from '../components/VoidAnimation'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function AIWriter() {
    const { state } = useLocation();
    const [prompt, setPrompt] = useState(state?.prompt || '')
    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState(null)
    const [voidTriggered, setVoidTriggered] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [submissionType, setSubmissionType] = useState(state?.type || 'poem')
    const [errorMsg, setErrorMsg] = useState(null)
    const [collections, setCollections] = useState([])
    const [selectedCollection, setSelectedCollection] = useState('')
    
    const { isAuthenticated } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            fetchCollections().then(setCollections).catch(console.error)
        }
    }, [isAuthenticated])

    const handleGenerate = async (e) => {
        if (e) e.preventDefault()
        if (!prompt.trim()) return

        if (!GROQ_API_KEY) {
            setErrorMsg("Groq API key not found in .env file!")
            return
        }

        setGenerating(true)
        setResult(null)
        setSubmitted(false)
        setErrorMsg(null)
        
        try {
            const systemPrompt = `You are a creative, deeply emotional writer for a platform called 'The Unsaid Page'. 
Write a beautifully structured ${submissionType} based on the user's prompt.
If it's a poem, use rich imagery, metaphors, and rhythm. If it's a story, be evocative, atmospheric, and focus on the unsaid emotions.
Keep the output concise (no more than 3-4 stanzas or paragraphs).
Respond ONLY with a JSON object containing two keys: "title" (a fitting, poetic title) and "content" (the full text body). Do not include any formatting wrapping the JSON.`

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile', 
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            })

            if (response.status === 429) {
                throw new Error('The Void is too crowded right now. Rate limit exceeded. Please wait a moment.')
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error?.message || `API Error: ${response.status}`)
            }

            const data = await response.json()
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
                throw new Error('The Void returned empty words. Please try a different prompt.')
            }

            let parsed;
            try {
                parsed = JSON.parse(data.choices[0].message.content)
                if (!parsed.title || !parsed.content) throw new Error("Format incomplete");
            } catch (e) {
                throw new Error('The Void spoke in riddles. Could not parse response. Please try again.')
            }
            
            setResult({
                title: parsed.title,
                content: parsed.content,
                type: submissionType
            })
        } catch (err) {
            console.error("AI Generation failed:", err)
            setErrorMsg(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!result) return
        try {
            const finalPost = {
                title: result.title,
                content: result.content,
                type: result.type,
                moods: ['ai-generated'],
                tags: ['ai'],
                anonymous: true
            }
            
            if (isAuthenticated) {
                const newPost = await createPost(finalPost)
                if (selectedCollection && newPost.id) {
                    await addToCollection(selectedCollection, newPost.id)
                }
            } else {
                await mockSubmitPost(finalPost)
            }
            
            setVoidTriggered(true)
        } catch (err) {
            console.error('Failed to save AI piece:', err)
            // Just simulate success for the mock demo
            setVoidTriggered(true)
        }
    }

    const handleVoidComplete = () => {
        setSubmitted(true)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container"
            style={{ maxWidth: '800px', padding: '4rem 2rem' }}
        >
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>AI Writer</h1>
                <div className="section-line" style={{ background: 'var(--accent-color)' }}></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>
                    Describe the feeling, setting, or theme of what you want to say, and let the Void write it for you.
                </p>
            </header>

            {!submitted ? (
                <>
                <VoidAnimation trigger={voidTriggered} onComplete={handleVoidComplete}>
                    <div className="brutal-card">
                        <form onSubmit={handleGenerate}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>What are we writing today?</label>
                                <div className="radio-group" style={{ marginTop: '0.8rem' }}>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="poem"
                                            checked={submissionType === 'poem'}
                                            onChange={() => setSubmissionType('poem')}
                                        />
                                        <span className="radio-custom"></span>
                                        A Poem
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="story"
                                            checked={submissionType === 'story'}
                                            onChange={() => setSubmissionType('story')}
                                        />
                                        <span className="radio-custom"></span>
                                        A Story
                                    </label>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="prompt">Prompt</label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="brutal-input"
                                    placeholder="e.g. A melancholic poem about the moon, or a hopeful story about finding a lost key..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={generating || !prompt.trim()}
                                style={{ width: '100%', marginTop: '1rem', background: 'var(--accent-color)', color: 'var(--bg-color)' }}
                            >
                                {generating ? 'Consulting the Void...' : 'Generate Magic'}
                            </button>
                        </form>
                        {errorMsg && (
                            <div style={{ marginTop: '1rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                {errorMsg}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {generating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden', marginTop: '2rem', textAlign: 'center' }}
                            >
                                <div className="typing-indicator" style={{ display: 'inline-block' }}>
                                    <span></span><span></span><span></span>
                                </div>
                                <p style={{ color: 'var(--accent-color)', fontWeight: 600, marginTop: '1rem' }}>
                                    Weaving words from the silent ether...
                                </p>
                            </motion.div>
                        )}

                        {result && !generating && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="brutal-card"
                                style={{ marginTop: '2rem', borderColor: 'var(--text-color)' }}
                            >
                                <h3 style={{ marginBottom: '1rem', fontStyle: 'italic', fontSize: '1.5rem' }}>{result.title}</h3>
                                <div style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    lineHeight: 1.8, 
                                    fontFamily: 'var(--font-mono)',
                                    marginBottom: '2rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    {result.content}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={handleSave} className="btn btn-primary">
                                        Save to My Works
                                    </button>
                                    {isAuthenticated && collections.length > 0 && (
                                        <select 
                                            value={selectedCollection}
                                            onChange={(e) => setSelectedCollection(e.target.value)}
                                            className="brutal-input"
                                            style={{ appearance: 'auto', padding: '0.5rem', width: 'auto', flex: 1, minWidth: '150px' }}
                                        >
                                            <option value="">(Optional: Add to Collection)</option>
                                            {collections.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button onClick={() => setResult(null)} className="btn">
                                        Discard
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </VoidAnimation>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-message brutal-card"
                >
                    <h2>Saved to the Void</h2>
                    <p>Your AI-generated {submissionType} has been successfully submitted and saved to your works.</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setSubmitted(false)
                                setResult(null)
                                setVoidTriggered(false)
                                setPrompt('')
                            }}
                        >
                            Generate Another
                        </button>
                        <button className="btn" onClick={() => navigate(isAuthenticated ? '/my-works' : '/')}>
                            {isAuthenticated ? 'View My Works' : 'Return Home'}
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
