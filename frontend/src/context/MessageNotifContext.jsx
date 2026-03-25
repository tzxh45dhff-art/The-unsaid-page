import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { getFriends } from '../api/penpals';

const MessageNotifContext = createContext();

export const MessageNotifProvider = ({ children }) => {
    const { isAuthenticated, user } = useUser();
    const [unreadCounts, setUnreadCounts] = useState({});   // { friendship_id: count }
    const [toast, setToast] = useState(null);
    const [friends, setFriends] = useState([]);
    const [activeChatFriendshipId, setActiveChatFriendshipId] = useState(null);

    // Fetch friends list so we can resolve names for toasts
    useEffect(() => {
        if (!isAuthenticated) return;
        getFriends()
            .then(f => setFriends(f))
            .catch(() => {});
    }, [isAuthenticated]);

    // Global Supabase Realtime subscription for new messages
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const channel = supabase
            .channel('global-msg-notif')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const msg = payload.new;
                    // Skip our own messages
                    if (msg.sender_id === user.id) return;
                    // Skip if user is in this chat right now
                    if (activeChatFriendshipId === msg.friendship_id) return;

                    // Increment unread
                    setUnreadCounts(prev => ({
                        ...prev,
                        [msg.friendship_id]: (prev[msg.friendship_id] || 0) + 1
                    }));

                    // Toast
                    const sender = friends.find(f => f.friendship_id === msg.friendship_id);
                    const name = sender?.display_name || sender?.username || 'A pen pal';
                    setToast({ name, content: msg.content, id: Date.now() });
                    setTimeout(() => setToast(null), 4000);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [isAuthenticated, user?.id, activeChatFriendshipId, friends]);

    // Total unread across all chats
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    const clearUnread = useCallback((friendshipId) => {
        setUnreadCounts(prev => {
            const next = { ...prev };
            delete next[friendshipId];
            return next;
        });
    }, []);

    const markChatActive = useCallback((friendshipId) => {
        setActiveChatFriendshipId(friendshipId);
        if (friendshipId) clearUnread(friendshipId);
    }, [clearUnread]);

    const refreshFriends = useCallback(() => {
        if (!isAuthenticated) return;
        getFriends().then(f => setFriends(f)).catch(() => {});
    }, [isAuthenticated]);

    return (
        <MessageNotifContext.Provider value={{
            unreadCounts, totalUnread,
            clearUnread, markChatActive, refreshFriends,
        }}>
            {children}

            {/* Global toast — renders above everything */}
            <AnimatePresence>
                {toast && (
                    <motion.div key={toast.id}
                        initial={{ opacity: 0, y: -30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 99999, background: 'linear-gradient(135deg, #c9a96e, #b8944f)',
                            color: '#1a1a1a', padding: '0.75rem 1.5rem', borderRadius: '14px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxWidth: '420px', width: 'max-content',
                            display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit',
                        }}
                        onClick={() => setToast(null)}
                    >
                        <span style={{ fontSize: '1.3rem' }}>💬</span>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{toast.name}</div>
                            <div style={{
                                fontSize: '0.8rem', opacity: 0.75, whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px'
                            }}>{toast.content}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MessageNotifContext.Provider>
    );
};

export const useMessageNotif = () => useContext(MessageNotifContext);
