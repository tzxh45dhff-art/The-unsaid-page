import api from './apiClient';

export const fetchCollections = async () => {
    const { data } = await api.get('/collections/me');
    return data;
};

export const createCollection = async (name) => {
    const { data } = await api.post('/collections/me', { name });
    return data;
};

export const addToCollection = async (collectionId, postId) => {
    const { data } = await api.post(`/collections/me/${collectionId}/items`, { post_id: postId });
    return data;
};

export const deleteCollection = async (collectionId) => {
    const { data } = await api.delete(`/collections/me/${collectionId}`);
    return data;
};
export const removeFromCollection = async (collectionId, postId) => {
    const res = await api.delete(`/collections/me/${collectionId}/items/${postId}`);
    return res.data;
};

export const fetchCollectionItems = async (collectionId) => {
    const { data } = await api.get(`/collections/me/${collectionId}/items`);
    return data;
};
