import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useMessageNotif } from '../context/MessageNotifContext';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import {
    getFriends,
    getPendingRequests,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    getSparks,
    sendSpark,
    markSparkRead
} from '../api/penpals';

export default function PenPals() {
    const { isAuthenticated, user } = useUser();
    const { unreadCounts, clearUnread, markChatActive } = useMessageNotif();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sparks, setSparks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Add friend
    const [searchUsername, setSearchUsername] = useState('');
    const [requestStatus, setRequestStatus] = useState(null);

    // Chat
    const [chatFriend, setChatFriend] = useState(null);

    // Spark modal
    const [showSparkModal, setShowSparkModal] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState('');
    const [sparkPrompt, setSparkPrompt] = useState('');
    const [sparkType, setSparkType] = useState('poem');
    const [sparkSending, setSparkSending] = useState(false);

    // Action loading
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated, activeTab]);

    // Tell the global context when we leave this page
    useEffect(() => {
        return () => markChatActive(null);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            if (activeTab === 'friends' || activeTab === 'chat') {
                const [f, s] = await Promise.all([getFriends(), getSparks()]);
                setFriends(f);
                setSparks(s);
            } else if (activeTab === 'requests') {
                const r = await getPendingRequests();
                setRequests(r);
            }
        } catch (err) {
            setFetchError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        const name = searchUsername.trim();
        if (!name) return;
        setRequestStatus({ type: 'sending', msg: `Sending request to @${name}...` });
        try {
            await sendFriendRequest(name);
            setRequestStatus({ type: 'success', msg: `✓ Friend request sent to @${name}!` });
            setSearchUsername('');
            setTimeout(() => setRequestStatus(null), 4000);
        } catch (err) {
            let msg = err.message;
            if (msg.toLowerCase().includes('not found'))
                msg = `User "@${name}" not found. Check the username and try again.`;
            else if (msg.toLowerCase().includes('cannot add yourself'))
                msg = "You can't send a friend request to yourself!";
            else if (msg.toLowerCase().includes('already connected'))
                msg = `You already have a connection with @${name}.`;
            setRequestStatus({ type: 'error', msg });
        }
    };

    const handleAccept = async (userId) => {
        setActionLoading(userId);
        try { await acceptRequest(userId); await fetchData(); }
        catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (userId) => {
        setActionLoading(userId);
        try { await rejectRequest(userId); await fetchData(); }
        catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    const handleSendSpark = async (e) => {
        e.preventDefault();
        setSparkSending(true);
        try {
            await sendSpark(selectedFriendId, sparkPrompt, sparkType);
            setShowSparkModal(false);
            setSparkPrompt('');
            setRequestStatus({ type: 'success', msg: '✓ Spark sent!' });
            setTimeout(() => setRequestStatus(null), 4000);
        } catch (err) {
            setRequestStatus({ type: 'error', msg: err.message });
        } finally {
            setSparkSending(false);
        }
    };

    const handleMarkRead = async (sparkId) => {
        try { await markSparkRead(sparkId); fetchData(); }
        catch (err) { console.error(err); }
    };

    const openChat = (friend) => {
        setChatFriend(friend);
        setActiveTab('chat');
        markChatActive(friend.friendship_id);
    };

    const statusStyle = (type) => {
        const base = { marginBottom: '1.5rem', padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' };
        if (type === 'sending') return { ...base, background: 'var(--glass-bg)', color: 'var(--text-muted)', border: '1px solid var(--text-muted)' };
        if (type === 'success') return { ...base, background: 'rgba(139,168,136,0.2)', color: 'var(--warm-sage)', border: '1px solid var(--warm-sage)' };
        if (type === 'error') return { ...base, background: 'rgba(201,127,127,0.2)', color: 'var(--warm-rose)', border: '1px solid var(--warm-rose)' };
        return base;
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Pen Pals</h1>
                <p>Sign in to connect with other writers.</p>
                <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '2rem' }}>Sign In</button>
            </div>
        );
    }

    // Chat view — full width
    if (activeTab === 'chat' && chatFriend) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Pen Pals</h1>
                    <div className="section-line"></div>
                </header>
                <Chat
                    friend={chatFriend}
                    friendshipId={chatFriend.friendship_id}
                    currentUserId={user?.id}
                    onBack={() => { setChatFriend(null); setActiveTab('friends'); }}
                />
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Pen Pals</h1>
                <div className="section-line"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
                    Connect with fellow writers. Send them "Sparks" or chat in real-time.
                </p>
            </header>


            {/* Status banner */}
            <AnimatePresence>
                {requestStatus && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={statusStyle(requestStatus.type)}>
                        {requestStatus.type === 'sending' && <span className="spinner-sm" />}
                        {requestStatus.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['friends', 'requests', 'add'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                        onClick={() => { setActiveTab(tab); if (tab === 'add') setRequestStatus(null); }}
                    >
                        {tab === 'friends' ? 'Friends & Sparks' : tab === 'requests' ? `Pending ${requests.length ? `(${requests.length})` : ''}` : 'Add a Friend'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner-sm" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            ) : fetchError ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--warm-rose)', marginBottom: '1rem' }}>{fetchError}</p>
                    <button className="btn" onClick={fetchData}>Retry</button>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {/* FRIENDS & SPARKS */}
                    {activeTab === 'friends' && (
                        <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {/* Sparks */}
                            <h2 className="section-heading">Incoming Sparks</h2>
                            {sparks.length === 0 ? (
                                <p className="muted-text">No sparks yet. Ask your pen pals to send one!</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                                    {sparks.map(s => (
                                        <div key={s.id} className="brutal-card" style={{ borderLeft: s.status === 'unread' ? '3px solid var(--accent-color)' : 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-color)', fontWeight: 'bold' }}>{s.draft_type} Idea</span>
                                                    <h3 style={{ margin: '0.5rem 0 0' }}>From {s.sender_name || s.sender_username}</h3>
                                                </div>
                                                {s.status === 'unread' && <span style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 'bold' }}>NEW</span>}
                                            </div>
                                            <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>"{s.prompt_text}"</p>
                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                <button className="btn btn-primary" onClick={() => navigate('/submit', { state: { prompt: s.prompt_text, type: s.draft_type } })}>Write It</button>
                                                <button className="btn" onClick={() => navigate('/ai-writer', { state: { prompt: s.prompt_text, type: s.draft_type } })}>Let AI Write</button>
                                                {s.status === 'unread' && <button className="btn" style={{ marginLeft: 'auto', background: 'transparent', fontSize: '0.85rem' }} onClick={() => handleMarkRead(s.id)}>Mark Read</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Friends */}
                            <h2 className="section-heading">Your Pen Pals</h2>
                            {friends.length === 0 ? (
                                <p className="muted-text">No pen pals yet. Go to "Add a Friend" to find writers!</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
                                    {friends.map(f => (
                                        <div key={f.id} className="brutal-card" style={{ padding: '1.5rem', overflow: 'hidden', boxSizing: 'border-box' }}>
                                            <h3 style={{ marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.display_name || f.username}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{f.username}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
                                                <button className="btn btn-primary" style={{ width: '100%', boxSizing: 'border-box', position: 'relative' }} onClick={() => openChat(f)}>
                                                    💬 Chat
                                                    {unreadCounts[f.friendship_id] > 0 && (
                                                        <span style={{
                                                            position: 'absolute', top: '-6px', right: '-6px',
                                                            background: 'var(--warm-rose)', color: '#fff',
                                                            fontSize: '0.7rem', fontWeight: 800,
                                                            width: '22px', height: '22px', borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                            animation: 'pulse-badge 1.5s ease-in-out infinite'
                                                        }}>
                                                            {unreadCounts[f.friendship_id]}
                                                        </span>
                                                    )}
                                                </button>
                                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                                                    <button className="btn" style={{ flex: 1, fontSize: '0.8rem', minWidth: 0, boxSizing: 'border-box' }} onClick={() => { setSelectedFriendId(f.id); setShowSparkModal(true); }}>
                                                        ✨ Spark
                                                    </button>
                                                    <button className="btn" style={{ flex: 1, fontSize: '0.8rem', minWidth: 0, boxSizing: 'border-box', borderColor: 'var(--warm-rose)', color: 'var(--warm-rose)' }} disabled={actionLoading === f.id} onClick={() => handleReject(f.id)}>
                                                        {actionLoading === f.id ? '...' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PENDING REQUESTS */}
                    {activeTab === 'requests' && (
                        <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h2 className="section-heading">Pending Requests</h2>
                            {requests.length === 0 ? (
                                <p className="muted-text">No pending requests.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {requests.map(r => (
                                        <div key={r.request_id} className="brutal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{r.display_name || r.username}</h3>
                                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{r.username}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button className="btn btn-primary" disabled={actionLoading === r.user_id} onClick={() => handleAccept(r.user_id)}>
                                                    {actionLoading === r.user_id ? 'Accepting...' : 'Accept'}
                                                </button>
                                                <button className="btn" disabled={actionLoading === r.user_id} onClick={() => handleReject(r.user_id)}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ADD A FRIEND */}
                    {activeTab === 'add' && (
                        <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="brutal-card">
                                <h2 style={{ marginBottom: '1.5rem' }}>Find a Writer</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter the exact username of someone you want to connect with.</p>
                                <form onSubmit={handleSendRequest}>
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input type="text" value={searchUsername} onChange={(e) => { setSearchUsername(e.target.value); setRequestStatus(null); }} className="brutal-input" placeholder="e.g. poeticmind42" required disabled={requestStatus?.type === 'sending'} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={requestStatus?.type === 'sending'}>
                                        {requestStatus?.type === 'sending' ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                <span className="spinner-sm" /> Sending...
                                            </span>
                                        ) : 'Send Request'}
                                    </button>
                                </form>
                                <AnimatePresence>
                                    {requestStatus && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={statusStyle(requestStatus.type)}>
                                            {requestStatus.msg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Spark Modal */}
            <AnimatePresence>
                {showSparkModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowSparkModal(false); }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="brutal-card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-color)' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Send a Spark ✨</h2>
                            <form onSubmit={handleSendSpark}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Type</label>
                                    <select value={sparkType} onChange={(e) => setSparkType(e.target.value)} className="brutal-input" style={{ appearance: 'auto' }}>
                                        <option value="poem">Poem</option>
                                        <option value="story">Story</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label>Prompt / Idea</label>
                                    <textarea value={sparkPrompt} onChange={(e) => setSparkPrompt(e.target.value)} className="brutal-input" rows="4" placeholder="e.g. Write about a clock that runs backward..." required disabled={sparkSending} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={sparkSending}>
                                        {sparkSending ? 'Sending...' : 'Send Spark'}
                                    </button>
                                    <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowSparkModal(false)} disabled={sparkSending}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .spinner-sm {
                    display: inline-block;
                    width: 14px; height: 14px;
                    border: 2px solid var(--text-muted);
                    border-top-color: var(--accent-color);
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse-badge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
                .section-heading {
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid var(--text-muted);
                    padding-bottom: 0.5rem;
                }
                .muted-text {
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                }
            `}</style>
        </motion.div>
    );
}
