const API_URL = process.env.REACT_APP_API_URL;

const assignmentService = {
  // Récupérer les assignations d'un événement
  getEventAssignments: async (eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/event/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Alias pour compatibilité
  getAssignments: async (eventId) => {
    return assignmentService.getEventAssignments(eventId);
  },

  // Assignation automatique
  autoAssign: async (eventId, options = {}) => {
    const response = await fetch(`${API_URL}/api/assignments/auto-assign/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(options)
    });
    return response.json();
  },

  // Assignation manuelle
  manualAssign: async (assignmentData) => {
    const response = await fetch(`${API_URL}/api/assignments/manual-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(assignmentData)
    });
    return response.json();
  },

  // Retirer un client d'une assignation
  removeClient: async (clientId, eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/remove-client`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ clientId, eventId })
    });
    return response.json();
  },

  // Assigner numéro de chambre réel
  setRealRoom: async (hotelId, eventId, logicalRoomId, realRoomNumber) => {
    const response = await fetch(`${API_URL}/api/assignments/set-real-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ hotelId, eventId, logicalRoomId, realRoomNumber })
    });
    return response.json();
  },

  // Statistiques d'assignation
  getStats: async (eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/stats/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // 🆕 Nouvelles méthodes
  
  // Déplacer un client
  moveClient: async (clientId, fromHotelId, toHotelId, eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/move-client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ clientId, fromHotelId, toHotelId, eventId })
    });
    return response.json();
  },

  // Échanger deux clients
  swapClients: async (client1Id, client2Id, eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/swap-clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ client1Id, client2Id, eventId })
    });
    return response.json();
  },

  // Valider les assignations
  validate: async (eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/validate/${eventId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Assignation en lot
  bulkAssign: async (clientIds, hotelId, eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/bulk-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ clientIds, hotelId, eventId })
    });
    return response.json();
  },

  // Vider toutes les assignations
  clearAll: async (eventId) => {
    const response = await fetch(`${API_URL}/api/assignments/clear/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};

export default assignmentService;
