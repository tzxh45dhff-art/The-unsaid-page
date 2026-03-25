import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
    const apiKey = process.env.VITE_GROQ_API_KEY;
    console.log("Using Key:", apiKey ? "Loaded successfully" : "Missing");

    try {
        const { data } = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a literary curator. Given a title, author, and excerpt of a poem or story, write a single evocative sentence (max 25 words) that captures its essence. Be poetic but concise. No quotes around the response.'
                    },
                    {
                        role: 'user',
                        content: `Title: "The Sea"\nAuthor: Unknown\nExcerpt: "The waves crashed against the shore, a relentless heartbeat of the world."`
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
        );
        console.log("Success! Groq Summary:");
        console.log(data.choices[0].message.content);
    } catch (err) {
        console.error("Groq Error:", err.response?.data || err.message);
    }
}

testGroq();
