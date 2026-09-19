import api from './axios';

export const fetchTopPriced = async () => {
  const { data } = await api.get('/items/top-priced');
  return data.items;
};

export const fetchItems = async (params = {}) => {
  const { data } = await api.get('/items', { params });
  return data.items;
};
