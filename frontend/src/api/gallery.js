import api from './axios';

export const fetchGallery = async () => {
  const { data } = await api.get('/gallery');
  return data.images;
};
