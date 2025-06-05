// ✅ CORRECTION: Utilise le service fetch corrigé
import api from './api';

export const authService = {
  // Connexion
  login: async (email, password) => {
    try {
      // ✅ ENLEVE /api du début
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user, token };
      } else {
        return {
          success: false,
          message: response.message || 'Erreur de connexion'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Erreur de connexion'
      };
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      // ✅ ENLEVE /api du début
      const response = await api.post('/auth/register', userData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.message || 'Erreur d\'inscription'
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.message || 'Erreur d\'inscription'
      };
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Utilisateur connecté
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir le token
  getToken: () => {
    return localStorage.getItem('token');
  }
};
