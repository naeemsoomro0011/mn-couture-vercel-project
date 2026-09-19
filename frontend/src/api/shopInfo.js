import api from './axios';

export const fetchShopInfo = async () => {
  const { data } = await api.get('/shop-info', { params: { _t: Date.now() } });
  return data.shopInfo;
};
