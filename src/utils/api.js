import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Services pour les hôtels
export const hotelService = {
  getAllHotels: () => api.get('/hotels'),
  getHotelById: (id) => api.get(`/hotels/${id}`),
  createHotel: (data) => api.post('/hotels', data),
  updateHotel: (id, data) => api.put(`/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
};

// Services pour les clients
export const clientService = {
  getAllClients: (params = {}) => api.get('/clients', { params }),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (data) => api.post('/clients', data),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  getGroups: () => api.get('/clients/groups'),
  importCSV: (formData) => api.post('/clients/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
