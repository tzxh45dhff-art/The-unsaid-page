import api from './apiClient';

export const getDailyPrompt = async () => {
    const { data } = await api.get('/prompts/daily');
    return data;
};
