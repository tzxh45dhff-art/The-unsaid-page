import api from './apiClient';

export const loginUser = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data; // { user, token }
};

export const registerUser = async ({ email, username, password, display_name }) => {
    const { data } = await api.post('/auth/register', { email, username, password, display_name });
    return data; // { user, token }
};

export const getMe = async () => {
    const { data } = await api.get('/auth/me');
    return data; // user object
};
