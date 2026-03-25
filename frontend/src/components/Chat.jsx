import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getMessages, sendMessage } from '../api/penpals';
import './Chat.css';

export default function Chat({ friend, friendshipId, currentUserId, onBack }) {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initial fetch
    useEffect(() => {
        if (!friendshipId) return;
        setLoading(true);
        getMessages(friendshipId)
            .then(data => { setMessages(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [friendshipId]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Supabase Realtime subscription for new messages
    useEffect(() => {
        if (!friendshipId) return;

        const channel = supabase
            .channel(`chat-${friendshipId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `friendship_id=eq.${friendshipId}`
                },
                (payload) => {
                    const newMessage = payload.new;
                    // Only add if we didn't already add it locally (from our own send)
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev, {
                            id: newMessage.id,
                            sender_id: newMessage.sender_id,
                            content: newMessage.content,
                            created_at: newMessage.created_at,
                            sender_username: newMessage.sender_id === currentUserId ? 'you' : friend.username,
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [friendshipId, currentUserId, friend]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || sending) return;

        const content = newMsg.trim();
        setNewMsg('');
        setSending(true);

        // Optimistic update
        const optimistic = {
            id: `temp-${Date.now()}`,
            sender_id: currentUserId,
            content,
            created_at: new Date().toISOString(),
            sender_username: 'you',
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const result = await sendMessage(friendshipId, content);
            // Replace optimistic with real
            setMessages(prev =>
                prev.map(m => m.id === optimistic.id ? { ...optimistic, id: result.id } : m)
            );
        } catch (err) {
            // Remove optimistic on failure
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            console.error('Failed to send:', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h3>{friend.display_name || friend.username}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{friend.username}</span>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div className="chat-empty">
                        <div style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--text-muted)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        No messages yet. Say hello to start the conversation! ✨
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`chat-bubble ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
                        >
                            {msg.content}
                            <div className="bubble-meta">
                                <span>{msg.sender_id !== currentUserId && (msg.sender_name || msg.sender_username)}</span>
                                <span>{formatTime(msg.created_at)}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    autoFocus
                />
                <button type="submit" disabled={!newMsg.trim() || sending}>
                    {sending ? '...' : 'Send'}
                </button>
            </form>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
