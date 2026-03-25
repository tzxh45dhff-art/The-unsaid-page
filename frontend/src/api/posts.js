import api from './apiClient';

export const fetchPosts = async (type) => {
    const params = type ? { type } : {};
    const { data } = await api.get('/posts', { params });
    return data;
};

export const fetchPostBySlug = async (slug) => {
    const { data } = await api.get(`/posts/${slug}`);
    return data;
};

export const createPost = async ({ title, body_markdown, type, excerpt }) => {
    const { data } = await api.post('/posts', { title, body_markdown, type, excerpt });
    return data;
};

export const toggleSnap = async (postId) => {
    const { data } = await api.post(`/snaps/${postId}`);
    return data; // { snapped: true/false }
};

export const completeRead = async (postId) => {
    const { data } = await api.post('/users/me/read-complete', { post_id: postId });
    return data; // { awarded: true/false, points }
};

export const fetchMyPosts = async () => {
    const { data } = await api.get('/posts/me/works');
    return data;
};

export const deletePost = async (id) => {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
};
