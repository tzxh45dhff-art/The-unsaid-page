import api from './apiClient';

export const fetchModerationQueue = async () => {
    const { data } = await api.get('/moderation/queue');
    return data;
};

export const moderatePost = async (postId, status, moderation_notes = '') => {
    const { data } = await api.patch(`/posts/${postId}/moderate`, { status, moderation_notes });
    return data;
};

export const moderateEcho = async (echoId, status) => {
    const { data } = await api.patch(`/moderation/echoes/${echoId}`, { status });
    return data;
};
