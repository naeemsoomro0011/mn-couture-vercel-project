import api from './axios';

// ---- Items ----
export const fetchAdminItems = async (search) => {
  const { data } = await api.get('/admin/items', { params: { search } });
  return data.items;
};
export const createAdminItem = async (payload) => (await api.post('/admin/items', payload)).data.item;
export const updateAdminItem = async (id, payload) => (await api.patch(`/admin/items/${id}`, payload)).data.item;
export const deleteAdminItem = async (id) => api.delete(`/admin/items/${id}`);

// ---- Gallery ----
export const fetchAdminGallery = async (search) => {
  const { data } = await api.get('/admin/gallery', { params: { search } });
  return data.images;
};
export const addAdminGalleryImages = async (images) => (await api.post('/admin/gallery', { images })).data.images;
export const updateAdminGalleryImage = async (id, payload) => (await api.patch(`/admin/gallery/${id}`, payload)).data.image;
export const deleteAdminGalleryImage = async (id) => api.delete(`/admin/gallery/${id}`);

// ---- Orders / Inbox ----
export const fetchAdminOrders = async () => (await api.get('/admin/orders')).data.orders;
export const fetchUnseenOrderCount = async () => (await api.get('/admin/orders/unseen-count')).data.count;
export const markOrderSeen = async (id) => api.patch(`/admin/orders/${id}/seen`);
export const markAllOrdersSeen = async () => api.patch('/admin/orders/seen-all');
export const approveAdminOrder = async (id) => api.patch(`/admin/orders/${id}/approve`);
export const deleteAdminOrder = async (id) => api.delete(`/admin/orders/${id}`);

// ---- Messages (admin side of the Inbox chat) ----
export const fetchAdminThread = async (userId) => (await api.get(`/admin/messages/${userId}`)).data.messages;
export const sendAdminMessage = async (userId, text) => (await api.post(`/admin/messages/${userId}`, { text })).data.message;

// ---- Shop info ----
export const updateAdminShopInfo = async (payload) => (await api.patch('/admin/shop-info', payload)).data.shopInfo;

// ---- Admin profile ----
export const updateAdminProfile = async (payload) => api.patch('/admin/profile', payload);
export const requestAdminEmailChange = async (newEmail) => api.post('/admin/profile/request-email-change', { newEmail });
export const confirmAdminOldEmail = async (otp) => api.post('/admin/profile/confirm-old-email', { otp });
export const confirmAdminNewEmail = async (otp) => api.post('/admin/profile/confirm-new-email', { otp });
export const updateAdminPassword = async (payload) => api.patch('/admin/profile/password', payload);
