// URL de base de l'API - CORRECTION ICI
import API_BASE_URL from '../config/api';

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

// Service pour les hôtels
export const hotelService = {
  // Récupérer tous les hôtels
  getAllHotels: async () => {
    const response = await fetch(`${API_BASE_URL}/api/hotels`);
    return await response.json();
  },

  // Récupérer un hôtel par ID
  getHotelById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`);
    return await response.json();
  },

  // Créer un hôtel
  createHotel: async (hotelData) => {
    const response = await fetch(`${API_BASE_URL}/api/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData)
    });
    return await response.json();
  },

  // Modifier un hôtel
  updateHotel: async (id, hotelData) => {
    const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData)
    });
    return await response.json();
  },

  // Supprimer un hôtel
  deleteHotel: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
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
  getGroups: () => api.get('/clients/groups'),
  importFromCSV: (formData) => {
    return fetch(`${API_BASE_URL}/clients/import-csv`, {
      method: 'POST',
      body: formData // FormData pour l'upload de fichier
    });
  }
};

export default api;
