import api from './apiClient';

/**
 * Extract a useful error message from an axios error.
 */
function extractError(err) {
    const detail = err.response?.data?.detail;
    if (detail) return detail;
    if (err.response?.status === 404) return 'Not found';
    if (err.response?.status === 401) return 'Please log in first';
    return err.message || 'Something went wrong';
}

// ── Friendships ──

export const getFriends = async () => {
    try {
        const { data } = await api.get('/penpals/');
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const getPendingRequests = async () => {
    try {
        const { data } = await api.get('/penpals/pending');
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const sendFriendRequest = async (username) => {
    try {
        const { data } = await api.post('/penpals/request', { username });
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const acceptRequest = async (userId) => {
    try {
        const { data } = await api.post(`/penpals/accept/${userId}`);
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const rejectRequest = async (userId) => {
    try {
        const { data } = await api.post(`/penpals/reject/${userId}`);
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

// ── Sparks ──

export const getSparks = async () => {
    try {
        const { data } = await api.get('/penpals/sparks');
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const sendSpark = async (friendId, promptText, draftType) => {
    try {
        const { data } = await api.post('/penpals/sparks', {
            friend_id: friendId, prompt_text: promptText, draft_type: draftType
        });
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const markSparkRead = async (sparkId) => {
    try {
        const { data } = await api.post(`/penpals/sparks/${sparkId}/read`);
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

// ── Chat Messages ──

export const getMessages = async (friendshipId) => {
    try {
        const { data } = await api.get(`/penpals/messages/${friendshipId}`);
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};

export const sendMessage = async (friendshipId, content) => {
    try {
        const { data } = await api.post('/penpals/messages', {
            friendship_id: friendshipId, content
        });
        return data;
    } catch (err) { throw new Error(extractError(err)); }
};
