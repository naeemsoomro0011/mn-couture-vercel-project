import api from '../api/axios';

/** Uploads a File to the backend and returns a full, displayable image URL. */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};
