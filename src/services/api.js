// ✅ FINAL - NE PLUS TOUCHER
import API_BASE_URL from '../config/api';

// ✅ DEBUG - Voir ce qui est configuré
console.log('🔧 DEBUG API_BASE_URL:', API_BASE_URL);
console.log('🔧 DEBUG process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const api = {
  get: async (endpoint) => {
    const url = `${API_BASE_URL}${endpoint}`; // Exemple: API_BASE_URL/clients
    console.log('🔧 DEBUG - API_BASE_URL:', API_BASE_URL);
    console.log('🔧 DEBUG - endpoint:', endpoint);
    console.log('🔄 API Call:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  post: async (endpoint, data) => {
    try {
      console.log(`🔄 API POST: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// ✅ SERVICES HOTELS CORRIGÉS
export const hotelService = {
  getAllHotels: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  },

  getHotelById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  },

  createHotel: async (hotelData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(hotelData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  },

  updateHotel: async (id, hotelData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(hotelData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  },

  deleteHotel: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  }
};

// ✅ SERVICES CLIENTS CORRIGÉS
export const clientService = {
  getAllClients: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/clients${queryString ? `?${queryString}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getClientById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  createClient: (clientData) => api.post('/clients', clientData),
  
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  
  deleteClient: (id) => api.delete(`/clients/${id}`),
  
  getGroups: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/groups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // ✅ CORRECTION: Service CSV corrigé
  importFromCSV: async (formData) => {
    try {
      console.log('📤 Upload CSV vers:', `${API_BASE_URL}/clients/import-csv`);
      
      const response = await fetch(`${API_BASE_URL}/clients/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          // ❗ IMPORTANT: Ne pas mettre Content-Type pour FormData
        },
        body: formData // FormData directement
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Erreur upload'}`);
      }
      
      const data = await response.json();
      console.log('✅ Réponse CSV:', data);
      
      return data; // Retourne directement les données
    } catch (error) {
      console.error('❌ Erreur import CSV:', error);
      throw error;
    }
  }
};

// ✅ SERVICES EVENTS
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  createEvent: (eventData) => api.post('/events', eventData),
  
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// ✅ SERVICE AUTH
export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }
      
      console.log('✅ Connexion réussie');
      return data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  register: (userData) => api.post('/auth/register', userData),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

export default api;
