const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export default API_BASE_URL;

// ✅ AJOUT : Debug pour vérifier
console.log('🔧 API_BASE_URL configuré:', API_BASE_URL);