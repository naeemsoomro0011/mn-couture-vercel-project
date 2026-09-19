import api from './axios';

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data.order;
};

export const fetchMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data.orders;
};

export const updateMyOrder = async (id, payload) => api.patch(`/orders/${id}`, payload);
