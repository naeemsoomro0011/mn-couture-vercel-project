import api from './axios';

export const fetchMyMessages = async () => (await api.get('/messages')).data.messages;
export const sendMyMessage = async (text) => (await api.post('/messages', { text })).data.message;
