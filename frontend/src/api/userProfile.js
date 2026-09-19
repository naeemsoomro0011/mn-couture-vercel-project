import api from './axios';

export const updateMyProfile = async (payload) => api.patch('/auth/profile', payload);
export const requestMyEmailChange = async (newEmail) => api.post('/auth/profile/request-email-change', { newEmail });
export const confirmMyOldEmail = async (otp) => api.post('/auth/profile/confirm-old-email', { otp });
export const confirmMyNewEmail = async (otp) => api.post('/auth/profile/confirm-new-email', { otp });
export const updateMyPassword = async (payload) => api.patch('/auth/profile/password', payload);
