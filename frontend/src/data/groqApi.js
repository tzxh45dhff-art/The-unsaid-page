import axios from 'axios'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Generate a short poetic summary for a literary work.
 * Returns null if the API key is not set or the request fails.
 */
export async function generateSummary(title, excerpt, author) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
        console.warn('Groq summary generation failed: VITE_GROQ_API_KEY is missing in .env')
        return null
    }

    try {
        const { data } = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a literary curator. Given a title, author, and excerpt of a poem or story, write a single evocative sentence (max 25 words) that captures its essence. Be poetic but concise. No quotes around the response.'
                    },
                    {
                        role: 'user',
                        content: `Title: "${title}"\nAuthor: ${author || 'Unknown'}\nExcerpt: "${excerpt}"`
                    }
                ],
                temperature: 0.7,
                max_tokens: 60,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            }
        )

        return data.choices?.[0]?.message?.content?.trim() || null
    } catch (err) {
        console.warn('Groq summary generation failed:', err.message)
        return null
    }
}

// Cache to avoid re-fetching summaries for the same content
const summaryCache = new Map()

export async function getCachedSummary(id, title, excerpt, author) {
    if (summaryCache.has(id)) return summaryCache.get(id)

    const summary = await generateSummary(title, excerpt, author)
    if (summary) summaryCache.set(id, summary)
    return summary
}
