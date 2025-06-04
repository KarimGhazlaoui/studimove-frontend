// URL de base de l'API - CORRECTION ICI
const API_BASE_URL = 'https://studimove-hotel.onrender.com/api';

const api = {
  get: async (endpoint) => {
    try {
      console.log(`🔄 API Call: ${API_BASE_URL}${endpoint}`); // Debug
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      console.log(`🔄 API POST: ${API_BASE_URL}${endpoint}`);
      console.log('📤 Données envoyées:', data); // Debug
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // Récupérer la réponse même en cas d'erreur
      const responseData = await response.json();
      console.log('📥 Réponse serveur:', responseData); // Debug
      
      if (!response.ok) {
        console.error('❌ Erreur serveur:', responseData);
        throw new Error(`HTTP error! status: ${response.status} - ${responseData.message || 'Erreur inconnue'}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      console.log(`🔄 API Call: ${API_BASE_URL}${endpoint}`); // Debug
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      console.log(`🔄 API Call: ${API_BASE_URL}${endpoint}`); // Debug
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// Services pour les hôtels
export const hotelService = {
  getAllHotels: () => api.get('/hotels'),
  getHotelById: (id) => api.get(`/hotels/${id}`),
  createHotel: (hotelData) => api.post('/hotels', hotelData),
  updateHotel: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
};

// Services pour les clients - AJOUTEZ CETTE SECTION
export const clientService = {
  getAllClients: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/clients${queryString ? `?${queryString}` : ''}`);
  },
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (clientData) => api.post('/clients', clientData),
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  importFromCSV: (formData) => {
    return fetch(`${API_BASE_URL}/clients/import-csv`, {
      method: 'POST',
      body: formData // FormData pour l'upload de fichier
    });
  }
};

export default api;
