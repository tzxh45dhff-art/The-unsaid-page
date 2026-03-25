import api from './apiClient';

export const fetchMyDraft = async () => {
    const { data } = await api.get('/drafts/me');
    return data;
};

export const saveMyDraft = async (form_state) => {
    const { data } = await api.put('/drafts/me', { form_state });
    return data;
};

export const clearMyDraft = async () => {
    const { data } = await api.delete('/drafts/me');
    return data;
};
